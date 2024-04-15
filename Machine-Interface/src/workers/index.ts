export const getImageWorker = () => {
  const url = new URL('./image.worker.ts', import.meta.url);
  const worker = new Worker(url, { type: 'module' });
  return worker;
};

export const getSVGWorker = () => {
  const url = new URL('./svg.worker.ts', import.meta.url);
  const worker = new Worker(url, { type: 'module' });
  return worker;
};
