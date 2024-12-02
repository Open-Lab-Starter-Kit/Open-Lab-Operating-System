import Konva from 'konva';
import { defineStore } from 'pinia';
import { QTableProps } from 'quasar';
import { Constants } from 'src/constants';
import {
  DrawElement,
  GcodeFileSettings,
  SelectedElementType,
  MainSettings,
  ThicknessOperation,
  EngravingSettings,
} from 'src/interfaces/imageToGcode.interface';
import API from 'src/services/API.service';
import { configurationSettings } from 'src/services/configuration.loader.service';
import {
  createImageFromImageData,
  drawImageOnOffscreenCanvas,
  getImageDataFromOffscreenCanvas,
} from 'src/services/image.editor.service';
import {
  createSVGFromSVGContent,
  prepareSVGElementsForEngraving,
} from 'src/services/svg.editor.service';
import {
  elementsFilterByColor,
  elementsFilterByShape,
  svgElementAttributes,
} from 'src/services/svg.parse.service';
import { getImageWorker, getSVGWorker } from 'src/workers';
import { INode } from 'svgson';
import { shallowRef } from 'vue';

export const useImageToGcodeConvertor = defineStore('imageToGcodeConvertor', {
  state: () => ({
    activeTab: '' as string,
    imageFile: null as File | null,
    imageContent: '' as string,
    svgElementsToModify: [] as DrawElement[],
    gcodeSettings: shallowRef<GcodeFileSettings>({
      mainSettings: structuredClone(
        Constants.DEFAULT_GCODE_GENERATOR_SETTINGS.MAIN_SETTINGS
      ) as MainSettings,
      cuttingSettings: structuredClone(
        Constants.DEFAULT_GCODE_GENERATOR_SETTINGS.CUTTING_SETTINGS
      ) as ThicknessOperation,
      markingSettings: structuredClone(
        Constants.DEFAULT_GCODE_GENERATOR_SETTINGS.MARKING_SETTINGS
      ) as ThicknessOperation,
      engravingSettings: structuredClone(
        Constants.DEFAULT_GCODE_GENERATOR_SETTINGS.ENGRAVING_SETTINGS
      ) as EngravingSettings,
    }),
    modifiedSVGCutting: null as SVGGraphicsElement | null,
    modifiedSVGMarking: null as SVGGraphicsElement | null,
    modifiedImage: null as HTMLImageElement | null,
    imageConfig: structuredClone(
      Constants.DEFAULT_GCODE_GENERATOR_SETTINGS.IMAGE_CONFIGURATION
    ) as Konva.ImageConfig,
    isCanvasLoading: false as boolean,

    // table reactive states
    mappingTable: null as QTableProps | null,
    tableFilterType: 'shape' as string,
    tableSelectedElements: [] as QTableProps['selected'],
    tableProfileModels: {} as Record<string, string>,
    tableProfileAllModels: Constants.PROFILE_ALL_OPTIONS.CUSTOM as string,
    singleProfileOptions: Object.values(
      Constants.PROFILE_OPTIONS
    ) as Array<string>,
    allProfileOptions: Object.values(
      Constants.PROFILE_ALL_OPTIONS
    ) as Array<string>,
  }),
  actions: {
    async applySVGChanges() {
      this.isCanvasLoading = true;
      // rest the image and svg elements because of one should be profiled
      this.resetAllImageModifications();
      if (this.svgElementsToModify.length) {
        // use Worker to prevent blocking the main thread
        const worker = getSVGWorker();
        const data = await this.prepareSVGWorkerData();
        worker.postMessage(data);
        this.listenToWorkerResponse(worker);
      } else {
        this.isCanvasLoading = false;
      }
    },

    async applyImageChanges() {
      this.isCanvasLoading = true;
      // rest the image and svg elements because of one should be profiled
      this.resetAllImageModifications();
      // use Worker to prevent blocking the main thread
      const worker = getImageWorker();
      if (
        this.tableProfileAllModels ===
          Constants.PROFILE_ALL_OPTIONS.CUT_EVERYTHING ||
        this.tableProfileAllModels ===
          Constants.PROFILE_ALL_OPTIONS.MARK_EVERYTHING
      ) {
        const data = await this.prepareImageWorkerData(
          Constants.IMAGE_DRAW_TYPE.CUT_MARK
        );
        // send data to worker
        worker.postMessage(data);
        // listen to worker response data
        this.listenToWorkerResponse(worker);
      } else if (
        this.tableProfileAllModels ===
        Constants.PROFILE_ALL_OPTIONS.ENGRAVE_EVERYTHING
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

    setSvgElementsToModify(selectedElements: SelectedElementType[]) {
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
      const canvasElement = await drawImageOnOffscreenCanvas(
        this.imageContent,
        this.gcodeSettings.engravingSettings.dithering.resolution
      );
      const imageData = getImageDataFromOffscreenCanvas(canvasElement);

      const imageWorkerData = {
        imageData,
        drawType,
        dithering: JSON.stringify(
          this.gcodeSettings.engravingSettings.dithering
        ),
      };

      return imageWorkerData;
    },

    async prepareSVGWorkerData() {
      // catagories the elements based on the profiling type
      const cuttingElements: INode[] = [];
      const markingElements: INode[] = [];
      const engravingElements: INode[] = [];
      this.svgElementsToModify.forEach((element: DrawElement) => {
        if (element.type === 'Engrave')
          engravingElements.push(...element.elements);
        else if (element.type === 'Cut')
          cuttingElements.push(...element.elements);
        else markingElements.push(...element.elements);
      });

      // sort the elements first based on their id
      cuttingElements.sort(
        (a, b) => parseFloat(a.attributes.id) - parseFloat(b.attributes.id)
      );
      markingElements.sort(
        (a, b) => parseFloat(a.attributes.id) - parseFloat(b.attributes.id)
      );
      engravingElements.sort(
        (a, b) => parseFloat(a.attributes.id) - parseFloat(b.attributes.id)
      );

      const imageData = await prepareSVGElementsForEngraving(
        engravingElements,
        this.gcodeSettings.engravingSettings.dithering.resolution
      );
      const svgWorkerData = {
        imageData,
        svgElementAttributes: JSON.stringify(svgElementAttributes),
        elementsToCut: JSON.stringify(cuttingElements),
        elementsToMark: JSON.stringify(markingElements),
        dithering: JSON.stringify(
          this.gcodeSettings.engravingSettings.dithering
        ),
      };
      return svgWorkerData;
    },

    listenToWorkerResponse(worker: Worker) {
      // listen to the worker data
      worker.addEventListener('message', (e) => {
        const { cutSVGContent, markSVGContent, engravedImageData } = e.data;
        if (cutSVGContent) {
          // generate the cut svg element
          this.modifiedSVGCutting = createSVGFromSVGContent(cutSVGContent);
        }
        if (markSVGContent) {
          // generate the mark svg element
          this.modifiedSVGMarking = createSVGFromSVGContent(markSVGContent);
        }
        if (engravedImageData) {
          // generate the engraved image element
          this.modifiedImage = createImageFromImageData(engravedImageData);
        }
        this.isCanvasLoading = false;
      });
    },

    resetAllImageModifications() {
      this.modifiedImage = null;
      this.modifiedSVGCutting = null;
      this.modifiedSVGMarking = null;
    },

    resetMappingTable() {
      // clear the profile models and selected elements
      this.tableProfileModels = {};
      this.tableSelectedElements = [];
      this.tableProfileAllModels = Constants.PROFILE_ALL_OPTIONS.CUSTOM;
      if (this.tableFilterType === Constants.SVG_ELEMENTS_FILTER.SHAPE) {
        // fill it with cut values for all the shapes
        elementsFilterByShape.forEach((element) => {
          this.tableProfileModels[element.shape] =
            Constants.PROFILE_OPTIONS.NOTHING;
        });
      } else if (this.tableFilterType === Constants.SVG_ELEMENTS_FILTER.COLOR) {
        // fill it with cut values for all the shapes
        elementsFilterByColor.forEach((element) => {
          this.tableProfileModels[element.color] =
            Constants.PROFILE_OPTIONS.NOTHING;
        });
      }
    },
    resetImageConfiguration() {
      this.imageConfig = structuredClone(
        Constants.DEFAULT_GCODE_GENERATOR_SETTINGS.IMAGE_CONFIGURATION
      );
    },
  },
});
