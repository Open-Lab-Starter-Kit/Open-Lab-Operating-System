export const floydSteinbergDithering = (
  imageData: ImageData,
  grayShift: number
) => {
  const canvasElement = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvasElement.getContext('2d', {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  if (ctx) {
    const data = imageData.data;

    // Define Floyd-Steinberg error diffusion matrix
    const errorMatrix = [
      [0, 0, 0],
      [0, 0, 7],
      [3, 5, 1],
    ];

    // Iterate over each pixel in the image
    for (let y = 0; y < canvasElement.height; y++) {
      for (let x = 0; x < canvasElement.width; x++) {
        const index = (y * canvasElement.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 0) {
          // Calculate grayscale intensity using luminance formula
          const intensity =
            0.2126 * data[index] +
            0.7152 * data[index + 1] +
            0.0722 * data[index + 2];

          // Apply gray shift, Ensure intensity is within the valid range [0, 255]
          const shiftedIntensity = Math.min(
            Math.max(intensity + grayShift, 0),
            255
          );

          // Threshold the shifted intensity
          const newValue = shiftedIntensity < 128 ? 0 : 255;
          const error = shiftedIntensity - newValue;

          // Update the current pixel
          data[index] = data[index + 1] = data[index + 2] = newValue;
          data[index + 3] = 255; // Set alpha to 255

          // Diffuse the error to neighboring pixels
          for (let i = 0; i < 3; i++) {
            for (let j = -1; j <= 1; j++) {
              if (
                x + j >= 0 &&
                x + j < canvasElement.width &&
                y + i < canvasElement.height
              ) {
                const neighborIndex =
                  ((y + i) * canvasElement.width + (x + j)) * 4;
                data[neighborIndex] += error * (errorMatrix[i][j + 1] / 16);
                data[neighborIndex + 1] += error * (errorMatrix[i][j + 1] / 16);
                data[neighborIndex + 2] += error * (errorMatrix[i][j + 1] / 16);
              }
            }
          }
        }
      }
    }

    // Put the modified image data back onto the canvas
    ctx.putImageData(imageData, 0, 0);
  }
  return ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
};

export const orderedDithering = (imageData: ImageData, grayShift: number) => {
  const canvasElement = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvasElement.getContext('2d', {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  if (ctx) {
    const data = imageData.data;

    // Define the ordered dithering matrix
    const ditherMatrix = [
      [16, 144, 48, 176],
      [208, 80, 240, 112],
      [64, 192, 32, 160],
      [256, 128, 224, 96],
    ];

    // Iterate over each pixel in the image
    for (let y = 0; y < canvasElement.height; y++) {
      for (let x = 0; x < canvasElement.width; x++) {
        const index = (y * canvasElement.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 0) {
          // Calculate grayscale intensity using luminance formula
          const intensity =
            0.2126 * data[index] +
            0.7152 * data[index + 1] +
            0.0722 * data[index + 2];

          // Apply gray shift, Ensure intensity is within the valid range [0, 255]
          const shiftedIntensity = Math.min(
            Math.max(intensity + grayShift, 0),
            255
          );

          // Threshold the intensity using ordered dithering matrix
          const isBlack = shiftedIntensity < ditherMatrix[y % 4][x % 4];
          const threshold = isBlack ? 0 : 255;

          // Update the current pixel
          data[index] = data[index + 1] = data[index + 2] = threshold;
          data[index + 3] = 255; // Set alpha to 255
        }
      }
    }

    // Put the modified image data back onto the canvas
    ctx.putImageData(imageData, 0, 0);
  }
  return ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
};

export const halftoneDithering = (imageData: ImageData, grayShift: number) => {
  const canvasElement = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvasElement.getContext('2d', {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  if (ctx) {
    const data = imageData.data;

    // Define the halftone matrix
    const ditherMatrix = [
      [24, 10, 12, 26, 35, 47, 49, 37],
      [8, 0, 2, 14, 45, 59, 61, 51],
      [22, 6, 4, 16, 43, 57, 63, 53],
      [30, 20, 18, 28, 33, 41, 55, 39],
      [34, 46, 48, 36, 25, 11, 13, 27],
      [44, 58, 60, 50, 9, 1, 3, 15],
      [42, 56, 62, 52, 23, 7, 5, 17],
      [32, 40, 54, 38, 31, 21, 19, 29],
    ];

    // Iterate over each pixel in the image
    for (let y = 0; y < canvasElement.height; y++) {
      for (let x = 0; x < canvasElement.width; x++) {
        const index = (y * canvasElement.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 0) {
          // Calculate grayscale intensity using luminance formula
          const intensity =
            0.2126 * data[index] +
            0.7152 * data[index + 1] +
            0.0722 * data[index + 2];

          // Apply gray shift, Ensure intensity is within the valid range [0, 255]
          const shiftedIntensity = Math.min(
            Math.max(intensity + grayShift, 0),
            255
          );

          // Threshold the intensity using halftone matrix
          const isBlack =
            shiftedIntensity <
            ((1 + ditherMatrix[y % 8][x % 8]) * 256) /
              (1 + ditherMatrix.length * ditherMatrix.length);

          const threshold = isBlack ? 0 : 255;

          // Update the current pixel
          data[index] = data[index + 1] = data[index + 2] = threshold;
          data[index + 3] = 255; // Set alpha to 255
        }
      }
    }

    // Put the modified image data back onto the canvas
    ctx.putImageData(imageData, 0, 0);
  }
  return ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
};

export const randomDithering = (imageData: ImageData, grayShift: number) => {
  const canvasElement = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvasElement.getContext('2d', {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  if (ctx) {
    const data = imageData.data;

    // Iterate over each pixel in the image
    for (let y = 0; y < canvasElement.height; y++) {
      for (let x = 0; x < canvasElement.width; x++) {
        const index = (y * canvasElement.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 0) {
          // Calculate grayscale intensity using luminance formula
          const intensity =
            0.2126 * data[index] +
            0.7152 * data[index + 1] +
            0.0722 * data[index + 2];

          // Apply gray shift, Ensure intensity is within the valid range [0, 255]
          const shiftedIntensity = Math.min(
            Math.max(intensity + grayShift, 0),
            255
          );

          // Add random noise to the shifted intensity
          const noise = Math.random() * 255;

          const isBlack = shiftedIntensity < noise;

          const threshold = isBlack ? 0 : 255;

          // Update the current pixel
          data[index] = data[index + 1] = data[index + 2] = threshold;
          data[index + 3] = 255; // Set alpha to 255
        }
      }
    }

    // Put the modified image data back onto the canvas
    ctx.putImageData(imageData, 0, 0);
  }
  return ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
};

export const gridDithering = (
  imageData: ImageData,
  grayShift: number,
  blockSize: number,
  blockDistance: number
) => {
  const canvasElement = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvasElement.getContext('2d', {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  if (ctx) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const data = imageData.data;

    // Calculate the total intensity of the image
    let totalIntensity = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalIntensity +=
        0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }

    // Calculate the average intensity of the image
    const averageIntensity =
      totalIntensity / (canvasElement.width * canvasElement.height);

    // Iterate over each pixel in the image
    for (let y = 0; y < canvasElement.height; y++) {
      for (let x = 0; x < canvasElement.width; x++) {
        const index = (y * canvasElement.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 0) {
          // Calculate grayscale intensity using luminance formula
          const intensity =
            0.2126 * data[index] +
            0.7152 * data[index + 1] +
            0.0722 * data[index + 2];

          // Apply gray shift, Ensure intensity is within the valid range [0, 255]
          const shiftedIntensity = Math.min(
            Math.max(intensity + grayShift, 0),
            255
          );

          // Apply grid dithering threshold
          const isBlack =
            y % (blockSize + blockDistance) <= blockSize &&
            x % (blockSize + blockDistance) <= blockSize &&
            shiftedIntensity < averageIntensity;

          const threshold = isBlack ? 0 : 255;

          // Update the current pixel
          data[index] = data[index + 1] = data[index + 2] = threshold;
          data[index + 3] = 255; // Set alpha to 255
        }
      }
    }

    // Put the modified image data back onto the canvas
    ctx.putImageData(imageData, 0, 0);
  }
  return ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
};

export const averageDithering = (imageData: ImageData, grayShift: number) => {
  const canvasElement = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvasElement.getContext('2d', {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  if (ctx) {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const data = imageData.data;

    // Calculate the average intensity of the image
    let totalIntensity = 0;
    for (let i = 0; i < data.length; i += 4) {
      totalIntensity +=
        0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    }
    const averageIntensity =
      totalIntensity / (canvasElement.width * canvasElement.height);

    // Iterate over each pixel in the image
    for (let y = 0; y < canvasElement.height; y++) {
      for (let x = 0; x < canvasElement.width; x++) {
        const index = (y * canvasElement.width + x) * 4;
        const alpha = data[index + 3];
        if (alpha > 0) {
          // Calculate grayscale intensity using luminance formula
          const intensity =
            0.2126 * data[index] +
            0.7152 * data[index + 1] +
            0.0722 * data[index + 2];

          // Apply gray shift, Ensure intensity is within the valid range [0, 255]
          const shiftedIntensity = Math.min(
            Math.max(intensity + grayShift, 0),
            255
          );

          // Apply average dithering threshold
          const isBlack = shiftedIntensity < averageIntensity;
          const threshold = isBlack ? 0 : 255;

          // Update the current pixel
          data[index] = data[index + 1] = data[index + 2] = threshold;
          data[index + 3] = 255; // Set alpha to 255
        }
      }
    }

    // Put the modified image data back onto the canvas
    ctx.putImageData(imageData, 0, 0);
  }
  return ctx.getImageData(0, 0, canvasElement.width, canvasElement.height);
};
