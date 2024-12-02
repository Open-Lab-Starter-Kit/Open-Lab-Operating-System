import {
  modifySVGElementsForCuttingOrMarking,
  modifySVGElementsForEngraving,
} from 'src/services/svg.editor.service';

addEventListener('message', async (event) => {
  if (event.data) {
    const imageData = event.data.imageData;
    const svgElementAttributes = JSON.parse(event.data.svgElementAttributes);
    const elementsToCut = JSON.parse(event.data.elementsToCut);
    const elementsToMark = JSON.parse(event.data.elementsToMark);
    const dithering = JSON.parse(event.data.dithering);

    let cutSVGContent: string | null = null;
    let markSVGContent: string | null = null;
    let engravedImageData: ImageData | null = null;
    // modify all cutting elements
    if (elementsToCut.length) {
      cutSVGContent = modifySVGElementsForCuttingOrMarking(
        elementsToCut,
        svgElementAttributes
      );
    }

    // modify all marking elements
    if (elementsToMark.length) {
      markSVGContent = modifySVGElementsForCuttingOrMarking(
        elementsToMark,
        svgElementAttributes
      );
    }

    if (imageData) {
      // modify all engraving elements
      engravedImageData = await modifySVGElementsForEngraving(
        imageData,
        dithering
      );
    }
    postMessage({
      cutSVGContent,
      markSVGContent,
      engravedImageData,
    });
  }
});
