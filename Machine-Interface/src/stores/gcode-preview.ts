import { defineStore } from 'pinia';
import { Constants } from 'src/constants';
import { convertGCodeToSVG } from 'src/services/draw.gcode.service';
import { useDebuggerDialogStore } from './debugger-dialog';

interface CameraData {
  type: string;
  frame: string;
  time: string;
}

export const useGcodePreview = defineStore('gcodePreview', {
  state: () => ({
    svgElement: null as SVGSVGElement | null,
    showCamera: false as boolean,
    cameraFrame: '' as string,
    showGrid: true as boolean,
    GcodeCommandsColor: {
      G0: 'green',
      G1: 'red',
      G2: 'yellow',
      G3: 'orange',
    },
    ratio: (Constants.GRAPH_STEP_SIZE / 2) as number,
    previewState: {
      lastTouchDistance: 0,
      isPinching: false,
      pointerOffsetX: 0,
      pointerOffsetY: 0,
      clampedX: 0,
      clampedY: 0,
      clampedZ: 0,
    },
    debuggerStore: useDebuggerDialogStore(),
    isError: false as boolean,
    isPreviewBiggerThanPlatform: false as boolean,
  }),
  actions: {
    async createSVG(gcodeStr: string) {
      try {
        if (this.svgElement) {
          convertGCodeToSVG(this.svgElement, gcodeStr, this.GcodeCommandsColor);
        }
      } catch (error) {
        this.isError = true;
        this.debuggerStore.addLog(
          new Date(),
          Constants.FILE_MANAGER_DATA_TYPE,
          'Preview',
          error
        );
      }
    },
    setCameraFrame(res: CameraData) {
      this.cameraFrame = `data:image/png;base64,${res.frame}`;
    },
    resetErrorIndicator() {
      this.isError = false;
    },
  },
});
