import { Constants } from 'src/constants';
import { DitheringSettings } from 'src/interfaces/imageToGcode.interface';
import { TransformData } from 'src/interfaces/imageToGcode.interface';
import { INode, stringify } from 'svgson';
import {
  ditheringAnImage,
  drawImageOnOffscreenCanvas,
  getImageDataFromOffscreenCanvas,
} from './image.editor.service';
import toPath from 'element-to-path';
import { svgElementAttributes } from './svg.parse.service';
import { Config } from 'src/interfaces/configSettings.interface';
import { Helper } from 'dxf';

export const postProcessSvgDataURI = async (svgContent: string) => {
  const svgElementString = getSvgStringFromDataUri(svgContent);

  // find the default dimensions
  const dimensions = getDefaultSvgDimensions(svgElementString);
  let svgWidth = dimensions.width;
  let svgHeight = dimensions.height;

  let svgDataURI;
  if (svgElementString) {
    const calculatedDimensions = getCalculatedSvgDimensions(
      svgElementString,
      svgWidth,
      svgHeight
    );

    svgWidth = calculatedDimensions.calculatedWidth;
    svgHeight = calculatedDimensions.calculatedHeight;

    const updatedSvgString = replaceSvgDimensions(
      svgElementString,
      svgWidth,
      svgHeight
    );
    svgDataURI = await svgStringToBase64DataUri(updatedSvgString);
  } else {
    svgDataURI = await svgStringToBase64DataUri(svgElementString);
  }
  return {
    svgDataURI,
    svgWidth,
    svgHeight,
  };
};

// convert dxf to svg data uri
export const convertDXFToSVGDataURI = (fileContent: string) => {
  const helper = new Helper(fileContent);
  // create svg string from dxf string
  const svgContent = helper.toSVG();

  // Create a Data URL for the SVG
  const svgDataURL = `data:image/svg+xml;base64,${btoa(svgContent)}`;

  return svgDataURL;
};

// create an svg element from svg content string
export const createSVGFromSVGContent = (svgContent: string) => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
  const svgElement = svgDoc.querySelector('svg');
  return svgElement;
};

export const modifySVGElementsForCuttingOrMarking = (
  elements: INode[],
  svgElementAttributes: Record<string, string>
) => {
  const svgWidth = parseFloat(svgElementAttributes.width);
  const svgHeight = parseFloat(svgElementAttributes.height);

  elements.map((elementBody) => {
    // modify element attributes
    elementBody.attributes.stroke = 'black';
    elementBody.attributes.opacity = '1';
    elementBody.attributes.fill = 'none';
    elementBody.attributes['stroke-width'] = Math.min(
      svgWidth / svgHeight,
      0.01 * Math.min(svgWidth, svgHeight)
    ).toFixed(2);

    // Check if style attribute is defined
    if (elementBody.attributes.style) {
      let updatedStyle = elementBody.attributes.style;
      updatedStyle = updatedStyle.replace(/fill:\s*(.*?)(?:;|$)/, ''); // Remove fill property
      updatedStyle = updatedStyle.replace(/stroke:\s*(.*?)(?:;|$)/, ''); // Remove stroke property
      updatedStyle = updatedStyle.replace(/stroke-width:\s*(.*?)(?:;|$)/, ''); // Remove stroke property
      elementBody.attributes.style = updatedStyle;
    }
    // convert primitives elements to path elements
    convertElementToPath(elementBody);
  });

  // add element to the modified svg after applying the cutting
  const modifiedSvgContent = createSVGFromElements(
    elements,
    svgElementAttributes
  );

  // return svg content
  return modifiedSvgContent;
};

export const modifySVGElementsForEngraving = async (
  imageData: ImageData,
  dithering: DitheringSettings
) => {
  const ditheredImage = ditheringAnImage(imageData, dithering);
  return ditheredImage;
};

export const createSVGFromElements = (
  elements: INode[],
  svgElementAttributes: Record<string, string>
) => {
  // Initialize SVG string with namespace
  let svgString = '<svg';

  // Add attributes to the opening SVG tag
  for (const [key, value] of Object.entries(svgElementAttributes)) {
    svgString += ` ${key}="${value}"`;
  }

  // Close the opening SVG tag
  svgString += '>';

  // Add inner HTML for each element
  for (const elementBody of elements) {
    svgString += stringify(elementBody);
  }

  // Close the SVG element
  svgString += '</svg>';

  return svgString;
};

export const drawSVGOnCanvas = (
  svgElement: SVGGraphicsElement,
  config: Config | null
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    // draw the svg element on canvas
    const svgString = new XMLSerializer().serializeToString(svgElement);
    // Create a data URL from the SVG string
    const svgDataURL = 'data:image/svg+xml;base64,' + btoa(svgString);
    const image = new Image();

    // When the image is loaded, draw it onto the canvas
    image.onload = function () {
      const canvasElement = document.createElement('canvas');
      //set dimensions
      const width = image.width;
      const height = image.height;
      let scaleFactor;

      if (config) {
        // Calculate scale factor based on max dimensions
        scaleFactor = Math.min(
          config.machine_screen.width / width,
          config.machine_screen.height / height,
          100
        );
      } else {
        scaleFactor = 100;
      }
      const scaledWidth = width * scaleFactor;
      const scaledHeight = height * scaleFactor;
      // Set canvas dimensions
      canvasElement.width = scaledWidth;
      canvasElement.height = scaledHeight;

      const context = canvasElement.getContext('2d');

      context?.drawImage(image, 0, 0, scaledWidth, scaledHeight);

      resolve(canvasElement);
    };

    image.onerror = function (error) {
      reject(new Error('Error loading SVG image: ' + error));
    };

    image.src = svgDataURL;
  });
};

// convert the svg elements that needs to be engraved to image
export const prepareSVGElementsForEngraving = async (
  engravingElements: INode[],
  resolution: number
) => {
  let imageData = null;
  // create an image for engraving svg elements
  if (engravingElements.length) {
    // create new svg element
    const modifiedSvgContentForEngraving = createSVGFromElements(
      engravingElements,
      svgElementAttributes
    );

    // After that draw svg on canvas to fetch the image data
    const svgDataURI =
      'data:image/svg+xml;base64,' + btoa(modifiedSvgContentForEngraving);
    const canvasElement = await drawImageOnOffscreenCanvas(
      svgDataURI,
      resolution
    );
    imageData = getImageDataFromOffscreenCanvas(canvasElement);
  }
  return imageData;
};

const convertElementToPath = (element: INode) => {
  // get the d attribute of the element
  const path = toPath(element);
  // convert to path element
  element.name = 'path';
  element.attributes.d = path;
};

// helper function to get the transform data from the attributes of an element
// used mainly to calculate the transformation value of an element when inherited from parent node
export const calculateTransformationValue = (
  childAttributes: Record<string, string>,
  parentAttributes: Record<string, string>
) => {
  if (childAttributes.transform && parentAttributes.transform) {
    const childTransformValues = parseTransformAttribute(
      childAttributes.transform
    );
    const parentTransformValues = parseTransformAttribute(
      parentAttributes.transform
    );

    // Initialize the combined transform data
    const combinedTransformValues: TransformData = { ...parentTransformValues };

    // Merge child and parent transform values while considering their cumulative effect
    Object.keys(childTransformValues).forEach((key) => {
      const childValue = childTransformValues[key];
      const parentValue = combinedTransformValues[key];

      // Check if the key exists in both child and parent transform values
      if (Array.isArray(childValue) && Array.isArray(parentValue)) {
        // If both child and parent values are arrays, merge them element-wise
        combinedTransformValues[key] = childValue.map(
          (value, index) => value + parentValue[index]
        );
      } else if (
        typeof childValue === 'number' &&
        typeof parentValue === 'number'
      ) {
        // If both child and parent values are numbers, add them
        combinedTransformValues[key] = childValue + parentValue;
      } else {
        // Otherwise, just set the child value
        combinedTransformValues[key] = childValue;
      }
    });

    // Convert the combined transform values back to a transform attribute string
    return convertToTransformAttribute(combinedTransformValues);
  } else if (childAttributes.transform) {
    return childAttributes.transform;
  } else if (parentAttributes.transform) {
    return parentAttributes.transform;
  }
  return '';
};

// convert DataURI for svg to element string
export const getSvgStringFromDataUri = (svgDataUri: string) => {
  // Create a temporary <div> element
  const tempDiv = document.createElement('div');

  // Set the innerHTML of the <div> to be the data URI string
  tempDiv.innerHTML = atob(svgDataUri.split(',')[1]);

  // Find the first <svg> element within the <div>
  const svgElement = tempDiv.querySelector('svg');
  if (svgElement) {
    // Return the outerHTML of the <svg> element
    return svgElement.outerHTML;
  }
  return null;
};

// get svg dimensions from the viewBox attribute incase the width and height attributes are not included
const getDefaultSvgDimensions = (svgString: string | null) => {
  if (svgString) {
    const svgElement = createSVGFromSVGContent(svgString);
    if (svgElement) {
      // added to the main document to make sure the svg render on the browser
      document.body.appendChild(svgElement);

      // Initialize variables for bounding box
      let minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

      // Calculate the bounding box of the <svg> element itself
      const svgBBox = svgElement.getBBox();
      minX = Math.min(minX, svgBBox.x);
      minY = Math.min(minY, svgBBox.y);
      maxX = Math.max(maxX, svgBBox.x + svgBBox.width);
      maxY = Math.max(maxY, svgBBox.y + svgBBox.height);

      // Calculate width and height based on bounding box
      const width = maxX - minX;
      const height = maxY - minY;

      // added to the main document to make sure the svg render on the browser
      document.body.removeChild(svgElement);
      return { width, height };
    }
  }
  return {
    width: Constants.SVG_DIMENSION_DEFAULT_VALUE,
    height: Constants.SVG_DIMENSION_DEFAULT_VALUE,
  };
};

const getCalculatedSvgDimensions = (
  svgString: string,
  defaultWidth: number,
  defaultHeight: number
) => {
  const svgTagRegex = /<svg\s+([^>]*)>/;
  const svgTagMatch = svgString.match(svgTagRegex);

  if (svgTagMatch) {
    const svgAttributes = svgTagMatch[1];
    const widthMatch = svgAttributes.match(/width="([^"]+)"/);
    const heightMatch = svgAttributes.match(/height="([^"]+)"/);

    // Helper function to replace percentage values
    const replacePercentage = (value: string, total: number) => {
      const percentageMatch = value.match(/([\d.]+)%/);
      if (percentageMatch) {
        return (parseFloat(percentageMatch[1]) / 100) * total;
      }
      return parseFloat(value); // If not percentage, return as a number
    };

    let calculatedWidth = defaultWidth;
    let calculatedHeight = defaultHeight;

    // If width is found and it's in percentage, calculate the value
    if (widthMatch && widthMatch[1].includes('%')) {
      calculatedWidth = replacePercentage(widthMatch[1], defaultWidth);
    } else if (widthMatch) {
      calculatedWidth = parseFloat(widthMatch[1]);
    }

    // If height is found and it's in percentage, calculate the value
    if (heightMatch && heightMatch[1].includes('%')) {
      calculatedHeight = replacePercentage(heightMatch[1], defaultHeight);
    } else if (heightMatch) {
      calculatedHeight = parseFloat(heightMatch[1]);
    }

    return { calculatedWidth, calculatedHeight };
  }

  // If no <svg> tag or attributes are found, return default values
  return {
    calculatedWidth: defaultWidth,
    calculatedHeight: defaultHeight,
  };
};

const replaceSvgDimensions = (
  svgString: string,
  width: number,
  height: number
) => {
  const svgTagRegex = /<svg\s+([^>]*)>/;
  const svgTagMatch = svgString.match(svgTagRegex);

  if (svgTagMatch) {
    let svgAttributes = svgTagMatch[1];
    const widthMatch = svgAttributes.match(/width="([^"]+)"/);
    const heightMatch = svgAttributes.match(/height="([^"]+)"/);

    // Helper function to replace percentage values
    const replacePercentage = (value: string, total: number) => {
      const percentageMatch = value.match(/([\d.]+)%/);
      if (percentageMatch) {
        return (parseFloat(percentageMatch[1]) / 100) * total;
      }
      return parseFloat(value); // If not percentage, return as a number
    };

    // If width and height attributes are not present, add them
    if (!widthMatch && !heightMatch) {
      return svgString.replace(
        '<svg',
        `<svg width="${width}" height="${height}"`
      );
    } else {
      // Handle width replacement (whether percentage or absolute value)
      if (widthMatch) {
        let newWidth = width;
        if (widthMatch[1].includes('%')) {
          newWidth = replacePercentage(widthMatch[1], width);
        }
        svgAttributes = svgAttributes.replace(
          widthMatch[0],
          `width="${newWidth}"`
        );
      } else {
        // Add width if missing
        svgAttributes = svgAttributes.replace(
          'height=',
          `width="${width}" height=`
        );
      }

      // Handle height replacement (whether percentage or absolute value)
      if (heightMatch) {
        let newHeight = height;
        if (heightMatch[1].includes('%')) {
          newHeight = replacePercentage(heightMatch[1], height);
        }
        svgAttributes = svgAttributes.replace(
          heightMatch[0],
          `height="${newHeight}"`
        );
      } else {
        // Add height if missing
        svgAttributes = svgAttributes.replace(
          'width=',
          `height="${height}" width=`
        );
      }

      return svgString.replace(svgTagMatch[1], svgAttributes);
    }
  }

  return svgString;
};

export const svgStringToBase64DataUri = (svgString: string | null) => {
  if (svgString) {
    // Create a Blob object from the SVG string
    const blob = new Blob([svgString], { type: 'image/svg+xml' });

    // Read the Blob as a data URI
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
};

const parseTransformAttribute = (transformAttribute: string) => {
  // Regular expression pattern to match transform functions and their parameters
  const transformRegex = /(\w+)\(([^\)]+)\)/g;

  // Object to store parsed transformation data
  const transformData: TransformData = {};

  // Match each transform function and its parameters
  let match;
  while ((match = transformRegex.exec(transformAttribute)) !== null) {
    const [, transformFunction, params] = match;
    const paramArray = params
      .split(/\s*,\s*/)
      .map((value) => value.split(' ').map(parseFloat))[0]; // Convert parameter values to numbers
    transformData[transformFunction] =
      paramArray.length === 1 ? paramArray[0] : paramArray;
  }

  return transformData;
};

const convertToTransformAttribute = (transformData: TransformData): string => {
  // Initialize an empty array to store the transform strings
  const transformStrings: string[] = [];

  // Iterate over each key-value pair in the transform data
  Object.entries(transformData).forEach(([key, value]) => {
    // Convert the key-value pair to a string representation
    let transformString: string;

    if (Array.isArray(value)) {
      // If the value is an array, format it as a space-separated string
      transformString = `${key}(${value.join(',')})`;
    } else {
      // If the value is a single number, format it directly
      transformString = `${key}(${value})`;
    }

    // Add the formatted string to the array
    transformStrings.push(transformString);
  });

  // Join all transform strings with spaces and return the result
  return transformStrings.join(' ');
};

// function to match all color type to hex
export const convertColorToRgb = (color: string) => {
  // Helper function to convert RGB to hexadecimal
  // Function to convert hex color to RGB
  const hexToRGB = (hexColor: string) => {
    // Remove '#' if present
    hexColor = hexColor.replace('#', '');
    // Parse hex color to RGB components
    const bigint = parseInt(hexColor, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Helper function to convert named colors to hexadecimal
  const colorNameToHex = (color: string) => {
    if (typeof Constants.ALL_HEX_COLORS[color.toLowerCase()] != 'undefined')
      return Constants.ALL_HEX_COLORS[color.toLowerCase()];

    return Constants.ALL_HEX_COLORS.BLACK;
  };

  // Check if it's a named color
  if (/^[a-zA-Z]+$/.test(color)) {
    const hexColor = colorNameToHex(color);
    return hexToRGB(hexColor);
  }
  // Check if it's a hexadecimal color
  if (/^#[0-9A-Fa-f]{3,6}$/.test(color)) {
    return hexToRGB(color);
  }
  // Check if it's an RGB color
  if (/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.test(color)) {
    return color;
  }
  return Constants.RGB_COLOR.BLACK; // Return black color incase no color founded
};
