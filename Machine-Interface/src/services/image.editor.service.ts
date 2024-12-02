import { Constants } from 'src/constants';
import { Config } from 'src/interfaces/configSettings.interface';
import { DitheringSettings } from 'src/interfaces/imageToGcode.interface';
import {
  averageDithering,
  floydSteinbergDithering,
  gridDithering,
  halftoneDithering,
  orderedDithering,
  randomDithering,
} from './dithering.algorithms.service';

export const modifyImageForCuttingOrMarking = (imageData: ImageData) => {
  const scaleFactor = Math.min(imageData.width, imageData.height) / 400;
  const strokeWidth = 1 + scaleFactor * 2;
  const halfStrokeWidth = strokeWidth / 2;

  // Define the coordinates of the rectangle as a path
  const x1 = halfStrokeWidth;
  const y1 = halfStrokeWidth;
  const x2 = imageData.width - halfStrokeWidth;
  const y2 = imageData.height - halfStrokeWidth;

  const svgString = `
    <svg width="${imageData.width}" height="${imageData.height}" xmlns="http://www.w3.org/2000/svg">
      <path d="M ${x1},${y1} L ${x2},${y1} L ${x2},${y2} L ${x1},${y2} Z" stroke="black" fill="none" stroke-width="${strokeWidth}"/>
    </svg>
  `;
  return svgString;
};

export const modifyImageForEngraving = (
  imageData: ImageData,
  dithering: DitheringSettings
) => {
  const ditheringImageData = ditheringAnImage(imageData, dithering);
  return ditheringImageData;
};

export const drawImageOnOffscreenCanvas = (
  imageContent: string,
  resolution: number
) => {
  return new Promise<OffscreenCanvas>((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      const width = img.width;
      const height = img.height;

      // Determine the aspect ratio and calculate the scale factor dynamically
      const maxDimension = Math.max(width, height);
      const scaleFactor = (resolution / 10) * (100 / maxDimension);

      // Scale the dimensions
      const scaledWidth = Math.floor(width * scaleFactor);
      const scaledHeight = Math.floor(height * scaleFactor);

      const canvas = new OffscreenCanvas(scaledWidth, scaledHeight);
      const ctx = canvas.getContext('2d', {
        willReadFrequently: true,
      }) as OffscreenCanvasRenderingContext2D;

      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

      resolve(canvas);
    };
    img.onerror = function () {
      reject('Failed to load image.');
    };
    img.src = imageContent;
  });
};

export const drawImageOnCanvas = (
  image: HTMLImageElement,
  config: Config | null = null,
  backgroundColor = 'white'
) => {
  //set dimensions
  const width = image.width;
  const height = image.height;
  let scaleFactor;

  if (config) {
    // Calculate scale factor based on max dimensions
    scaleFactor = Math.min(
      config.machine_screen.width / width,
      config.machine_screen.height / height,
      10
    );
  } else {
    scaleFactor = 10;
  }

  const canvasElement = document.createElement('canvas');
  const scaledWidth = width * scaleFactor;
  const scaledHeight = height * scaleFactor;

  canvasElement.width = scaledWidth;
  canvasElement.height = scaledHeight;

  const context = canvasElement.getContext('2d');
  if (context) {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvasElement.width, canvasElement.height);
    context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
  }

  return canvasElement;
};

export const getImageDataFromOffscreenCanvas = (canvas: OffscreenCanvas) => {
  const context = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return imageData;
};

export const createImageFromImageData = (imageData: ImageData) => {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas dimensions based on ImageData dimensions
  canvas.width = imageData.width;
  canvas.height = imageData.height;

  if (ctx) {
    // Put the ImageData onto the canvas
    ctx.putImageData(imageData, 0, 0);
    // white background
    ctx.globalCompositeOperation = 'destination-over';
    // set the fill color to white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Create an image element
  const image = new Image();

  image.width = canvas.width;
  image.height = canvas.height;

  // Set image source to canvas's data URL
  image.src = canvas.toDataURL();
  return image;
};

export const fileFromImageUrl = async (imageUrl: string, fileName: string) => {
  const response = await fetch(imageUrl);

  const blob = await response.blob();
  const fileType = blob.type;

  return new File([blob], fileName, { type: fileType });
};

export const ditheringAnImage = (
  imageData: ImageData,
  dithering: DitheringSettings
) => {
  let image: ImageData | null = null;
  switch (dithering.algorithm) {
    case Constants.DITHERING_ALGORITHMS.FLOYDSTEINBERG:
      image = floydSteinbergDithering(imageData, dithering.grayShift);
      break;

    case Constants.DITHERING_ALGORITHMS.ORDERED:
      image = orderedDithering(imageData, dithering.grayShift);
      break;

    case Constants.DITHERING_ALGORITHMS.HALFTONE:
      image = halftoneDithering(imageData, dithering.grayShift);
      break;

    case Constants.DITHERING_ALGORITHMS.RANDOM:
      image = randomDithering(imageData, dithering.grayShift);
      break;

    case Constants.DITHERING_ALGORITHMS.AVERAGE:
      image = averageDithering(imageData, dithering.grayShift);
      break;

    case Constants.DITHERING_ALGORITHMS.GRID:
      image = gridDithering(
        imageData,
        dithering.grayShift,
        dithering.blockSize,
        dithering.blockDistance
      );
      break;

    default:
      break;
  }
  return image;
};
