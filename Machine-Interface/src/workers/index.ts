import imageWorker from 'src/workers/image.worker?worker&inline';
import svgWorker from 'src/workers/svg.worker?worker&inline';
import previewWorker from 'src/workers/preview.worker?worker&inline';

export const getImageWorker = () => {
  return new imageWorker();
};

export const getSVGWorker = () => {
  return new svgWorker();
};

export const getPreviewerWorker = () => {
  return new previewWorker();
};
