import {
  modifySVGElementsForCuttingOrMarking,
  modifySVGElementsForEngraving,
} from 'src/services/svg.editor.service';

addEventListener('message', async (event) => {
  if (event.data) {
    const imageData = event.data.imageData;
    const svgElementAttributes = JSON.parse(event.data.svgElementAttributes);
    const elementsToCut = JSON.parse(event.data.elementsToCut);
    const dithering = JSON.parse(event.data.dithering);

    let cutSVGContent: string | null = null;
    // modify all cutting/marking elements
    if (elementsToCut.length) {
      cutSVGContent = modifySVGElementsForCuttingOrMarking(
        elementsToCut,
        svgElementAttributes
      );
    }

    // modify all engraving elements
    const engravedImageData = await modifySVGElementsForEngraving(
      imageData,
      dithering
    );
    postMessage({
      cutSVGContent,
      engravedImageData,
    });
  }
});
