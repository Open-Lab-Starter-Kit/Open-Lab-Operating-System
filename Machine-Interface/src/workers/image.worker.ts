import { Constants } from 'src/constants';
import {
  modifyImageForEngraving,
  modifyImageForCuttingOrMarking,
} from 'src/services/image.editor.service';

addEventListener('message', (event) => {
  if (event.data) {
    let engravedImageData: ImageData | null = null;
    let cutSVGContent: string | null = null;
    const { drawType, imageData } = event.data;
    const ditheringSettings = JSON.parse(event.data.dithering);

    if (drawType === Constants.IMAGE_DRAW_TYPE.CUT_MARK) {
      cutSVGContent = modifyImageForCuttingOrMarking(imageData);
    } else if (Constants.IMAGE_DRAW_TYPE.ENGRAVE) {
      engravedImageData = modifyImageForEngraving(imageData, ditheringSettings);
    }
    postMessage({ cutSVGContent, engravedImageData });
  }
});
