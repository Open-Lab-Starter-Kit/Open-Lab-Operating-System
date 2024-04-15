import { defineStore } from 'pinia';
import { Constants } from 'src/constants';
import {
  DitheringSettings,
  DrawElement,
  GcodeFileSettings,
  SelectedElementType,
} from 'src/interfaces/imageToGcode.interface';
import {
  createImageFromImageData,
  drawImageOnOffscreenCanvas,
  getImageDataFromOffscreenCanvas,
} from 'src/services/image.editor.service';
import {
  createSVGFromElements,
  createSVGFromImageContent,
} from 'src/services/svg.editor.service';
import { svgElementAttributes } from 'src/services/svg.parse.service';
import { getImageWorker, getSVGWorker } from 'src/workers';
import { INode } from 'svgson';

export const useImageToGcodeConvertor = defineStore('imageToGcodeConvertor', {
  state: () => ({
    imageFile: null as File | null,
    imageContent: '' as string,
    svgElementsToModify: [] as DrawElement[],
    gcodeSettings: {
      dithering: {
        type: Constants.DITHERING_ALGORITHMS.FLOYDSTEINBERG,
        grayShift: 0,
        blockSize: 0.5,
        blockDistance: 0.1,
      } as DitheringSettings,
    } as GcodeFileSettings,
    modifiedSVG: null as HTMLElement | null,
    modifiedImage: null as HTMLImageElement | null,
    isCanvasLoading: false as boolean,
  }),
  actions: {
    async applySVGProfilingChanges(selectedElements: SelectedElementType[]) {
      this.isCanvasLoading = true;
      // rest the image and svg elements because of one should be profiled
      this.resetAllModifications();
      // use Worker to prevent blocking the main thread
      const worker = getSVGWorker();

      // set all the svg elements that the user want to use
      this.setsvgElementsToModify(selectedElements);
      if (this.svgElementsToModify.length) {
        const data = await this.prepareSVGWorkerData();
        worker.postMessage(data);
        this.listenToWorkerResponse(worker);
      } else {
        this.isCanvasLoading = false;
      }
    },

    async applyImageProfilingChanges(profileType: string) {
      this.isCanvasLoading = true;
      // rest the image and svg elements because of one should be profiled
      this.resetAllModifications();
      // use Worker to prevent blocking the main thread
      const worker = getImageWorker();
      if (
        profileType === Constants.PROFILE_ALL_OPTIONS.CUT_EVERYTHING ||
        profileType === Constants.PROFILE_ALL_OPTIONS.MARK_EVERYTHING
      ) {
        const data = await this.prepareImageWorkerData(
          Constants.IMAGE_DRAW_TYPE.CUT_MARK
        );
        // send data to worker
        worker.postMessage(data);
        // listen to worker response data
        this.listenToWorkerResponse(worker);
      } else if (
        profileType === Constants.PROFILE_ALL_OPTIONS.ENGRAVE_EVERYTHING
      ) {
        const data = await this.prepareImageWorkerData(
          Constants.IMAGE_DRAW_TYPE.ENGRAVE
        );

        // send data to worker
        worker.postMessage(data);
        // listen to worker response data
        this.listenToWorkerResponse(worker);
      } else {
        this.isCanvasLoading = false;
      }
    },

    setsvgElementsToModify(selectedElements: SelectedElementType[]) {
      // Iterate through the selected elements
      selectedElements.forEach((element) => {
        // Check if the element is being added or removed
        if (element.added) {
          if (
            element.profileType === Constants.PROFILE_OPTIONS.CUT ||
            element.profileType === Constants.PROFILE_OPTIONS.MARK
          ) {
            // incase of redrawing same element with different profile type
            this.svgElementsToModify = this.svgElementsToModify.filter(
              (ele) => {
                return ele.identifier !== element.identifier;
              }
            );

            // Add elements that need to be modified with an identifier to be able help remove it later
            this.svgElementsToModify.push({
              identifier: element.identifier,
              elements: element.elements,
              type: element.profileType,
            });
          } else if (
            element.profileType === Constants.PROFILE_OPTIONS.ENGRAVE
          ) {
            // incase of redrawing same element with different profile type
            this.svgElementsToModify = this.svgElementsToModify.filter(
              (ele) => ele.identifier !== element.identifier
            );

            // Add elements that need to be modified with an identifier to be able help remove it later
            this.svgElementsToModify.push({
              identifier: element.identifier,
              elements: element.elements,
              type: element.profileType,
            });
          }
        } else {
          // Find and remove the corresponding canvas element from the array
          this.svgElementsToModify = this.svgElementsToModify.filter(
            (ele) => ele.identifier !== element.identifier
          );
        }
      });
    },

    async prepareImageWorkerData(drawType: string) {
      // draw image on offscreen canvas
      const canvasElement = await drawImageOnOffscreenCanvas(this.imageContent);
      const imageData = getImageDataFromOffscreenCanvas(canvasElement);

      const imageWorkerData = {
        imageData,
        drawType,
        dithering: JSON.stringify(this.gcodeSettings.dithering),
      };

      return imageWorkerData;
    },

    async prepareSVGWorkerData() {
      // catagories the elements based on the profiling type
      const cuttingAndMarkingElements: INode[] = [];
      const engravingElements: INode[] = [];
      this.svgElementsToModify.forEach((element: DrawElement) => {
        if (element.type === 'Engrave')
          engravingElements.push(...element.elements);
        else cuttingAndMarkingElements.push(...element.elements);
      });
      // sort the elements first based on their id
      cuttingAndMarkingElements.sort(
        (a, b) => parseFloat(a.attributes.id) - parseFloat(b.attributes.id)
      );
      engravingElements.sort(
        (a, b) => parseFloat(a.attributes.id) - parseFloat(b.attributes.id)
      );

      // create new svg element
      const modifiedSvgContentForEngraving = createSVGFromElements(
        engravingElements,
        svgElementAttributes
      );

      // After that draw svg on canvas to fetch the image data
      const svgDataURL =
        'data:image/svg+xml;base64,' + btoa(modifiedSvgContentForEngraving);
      const canvasElement = await drawImageOnOffscreenCanvas(svgDataURL);
      const imageData = getImageDataFromOffscreenCanvas(canvasElement);

      const svgWorkerData = {
        imageData,
        svgElementAttributes: JSON.stringify(svgElementAttributes),
        elementsToCut: JSON.stringify(cuttingAndMarkingElements),
        dithering: JSON.stringify(this.gcodeSettings.dithering),
      };

      return svgWorkerData;
    },

    listenToWorkerResponse(worker: Worker) {
      // listen to the worker data
      worker.addEventListener('message', (e) => {
        const { cutSVGContent, engravedImageData } = e.data;
        if (cutSVGContent) {
          // generate the cut svg element
          this.modifiedSVG = createSVGFromImageContent(cutSVGContent);
        }
        if (engravedImageData) {
          // generate the engraved image element
          this.modifiedImage = createImageFromImageData(engravedImageData);
        }
        this.isCanvasLoading = false;
      });
    },

    resetAllModifications() {
      this.modifiedImage = null;
      this.modifiedSVG = null;
    },
  },
});
