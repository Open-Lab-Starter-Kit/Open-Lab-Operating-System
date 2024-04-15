import { Constants } from 'src/constants';
import { DitheringSettings } from 'src/interfaces/imageToGcode.interface';
import { TransformData } from 'src/interfaces/imageToGcode.interface';
import { INode, stringify } from 'svgson';
import { ditheringAnImage } from './image.editor.service';

// create an svg element from svg content string
export const createSVGFromImageContent = (cutSVGContent: string) => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(cutSVGContent, 'image/svg+xml');
  const svgElement = svgDoc.documentElement;
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
    elementBody.attributes['stroke-width'] =
      svgWidth / svgHeight >= 1 ? '0.1' : '1';
    // Check if style attribute is defined
    if (elementBody.attributes.style) {
      let updatedStyle = elementBody.attributes.style;
      updatedStyle = updatedStyle.replace(/fill:\s*(.*?)(?:;|$)/, ''); // Remove fill property
      updatedStyle = updatedStyle.replace(/stroke:\s*(.*?)(?:;|$)/, ''); // Remove stroke property
      updatedStyle = updatedStyle.replace(/stroke-width:\s*(.*?)(?:;|$)/, ''); // Remove stroke property
      elementBody.attributes.style = updatedStyle;
    }
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
