import { Constants } from 'src/constants';
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
  const scaleFactor = Math.min(imageData.width, imageData.height) / 200;
  const strokeWidth = 1 + scaleFactor * 2;
  const svgString = `
    <svg width="${imageData.width}" height="${imageData.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" stroke="black" fill="none" stroke-width="${strokeWidth}"/>
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

export const drawImageOnOffscreenCanvas = (imageContent: string) => {
  return new Promise<OffscreenCanvas>((resolve, reject) => {
    const img = new Image();
    img.onload = function () {
      const canvas = new OffscreenCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d', {
        willReadFrequently: true,
      }) as OffscreenCanvasRenderingContext2D;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0);

      resolve(canvas);
    };
    img.onerror = function () {
      reject('Failed to load image.');
    };
    img.src = imageContent;
  });
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

  // Put the ImageData onto the canvas
  ctx?.putImageData(imageData, 0, 0);

  // Create an image element
  const image = new Image();

  // Set image source to canvas's data URL
  image.src = canvas.toDataURL();
  return image;
};

export const ditheringAnImage = (
  imageData: ImageData,
  dithering: DitheringSettings
) => {
  let image: ImageData | null = null;
  switch (dithering.type) {
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
