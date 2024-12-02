import { defineStore } from 'pinia';
import { Constants } from 'src/constants';
import { Config } from 'src/interfaces/configSettings.interface';
import { CameraData, Point } from 'src/interfaces/gcodePreivew.interface';
import { configurationSettings } from 'src/services/configuration.loader.service';
import {
  add2DCameraFrame,
  add2DGrid,
  add2DLabels,
  add2DExecutedLineToGraph,
  dragAndDropControls,
  draw2DGraph,
  draw2DGcodeLinesOnGraph,
  remove2DCameraFrame,
  remove2DGrid,
  remove2DLabels,
  resetAll2DGraphElements,
  remove2DExecutionLayer,
  initDragAndDropControlsFor2DGraph,
} from 'src/services/draw.gcode.service/draw.gcode.2D.service';
import {
  add3DGrid,
  add3DExecutedLineToGraph,
  remove3DGrid,
  remove3DExecutionLayer,
  draw3DGraph,
  draw3DGcodeLinesOnGraph,
} from 'src/services/draw.gcode.service/draw.gcode.3D.service';
import { getPlatformDimensions } from 'src/services/draw.gcode.service/draw.gcode.helper.service';
import { convertLinesToSVGElements } from 'src/services/draw.gcode.service/draw.gcode.svg.service';
import { getPreviewerWorker } from 'src/workers';
import { useDebuggerDialogStore } from './debugger-dialog';

export const useGcodePreviewStore = defineStore('gcodePreview', {
  state: () => ({
    graphElement: document.createElement('div') as HTMLDivElement,
    cameraFrame: '' as string,
    graphSettings: {
      showCamera: false as boolean,
      showLabels: true as boolean,
      showGrid: true as boolean,
      GcodeCommandsColor: {
        G0: 'green',
        G1: 'red',
        G2: 'yellow',
        G3: 'red',
        executedLine: 'blue',
      },
      startPoint: {
        x: 0,
        y: 0,
        z: 0,
      } as Point,
    },
    debuggerStore: useDebuggerDialogStore(),
    gcodeJobSVGString: '' as string,
    isGcodeError: false as boolean,
    isGraphLoading: false as boolean,
    isGcodeBiggerThanPlatform: false as boolean,
    isNewFileToDraw: true as boolean,
    previewWebWorker: null as Worker | null,
  }),
  actions: {
    async createGcodePreviewerGraph(fileContent: string) {
      const config = await configurationSettings();
      if (
        config.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER ||
        config.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER
      ) {
        this.reset2DGraph();
        await this.create2DGraph(fileContent);
      } else if (config.machine_type === Constants.MACHINE_TYPE.CNC) {
        this.reset3DGraph();
        await this.create3DGraph(fileContent);
      }
    },
    async create2DGraph(gcode: string) {
      const config = await configurationSettings();
      // draw the graph
      draw2DGraph(this.graphElement, this.isNewFileToDraw);
      // incase of new file opened
      if (this.isNewFileToDraw) {
        // draw gcode
        await this.startDrawingGcodeOnGraph(gcode, config);
        // start drag and drop events for the graph
        initDragAndDropControlsFor2DGraph();
        // change to false until a new file is opened
        this.isNewFileToDraw = false;
      }

      // after finishing drawing the gcode lines add the grid, camera frames and labels
      if (this.graphSettings.showGrid) this.addGridTo2DGraph();
      if (this.graphSettings.showCamera) this.addCameraFrameTo2DGraph();
      if (this.graphSettings.showLabels) this.addLabelsTo2DGraph();
    },
    async create3DGraph(gcode: string) {
      const config = await configurationSettings();
      if (this.graphElement) {
        // draw the graph
        draw3DGraph(this.graphElement, this.isNewFileToDraw);
        // incase of new file opened
        if (this.isNewFileToDraw) {
          await this.startDrawingGcodeOnGraph(gcode, config, true);
        }
      }
    },
    async startDrawingGcodeOnGraph(
      gcodeStr: string,
      config: Config,
      is3DGraph = false
    ) {
      this.isGraphLoading = true;
      this.previewWebWorker = getPreviewerWorker();

      if (!this.previewWebWorker) {
        const error = new Error('Failed to initialize worker');
        this.handleGcodeError(error);
        return;
      }

      // Send data to worker
      const data = { gcodeStr, config };
      this.previewWebWorker.postMessage(data);

      // Listen to worker response data
      await this.listenToWebWorkerMessages(is3DGraph);
    },
    listenToWebWorkerMessages(is3DGraph: boolean) {
      return new Promise<void>((resolve, reject) => {
        if (this.previewWebWorker) {
          this.previewWebWorker.addEventListener('message', async (e) => {
            const config = await configurationSettings();
            const {
              error,
              linesToDraw,
              isBiggerThanPlatform,
              done,
              startPoint,
            } = e.data;

            // handle error from the web worker
            if (error) {
              this.handleGcodeError(error, is3DGraph);
              reject(error);
              return;
            }

            // incase the gcode is bigger than the platform
            if (isBiggerThanPlatform) {
              this.handleGcodeBiggerThanPlatform(is3DGraph);
            }

            // handle drawing gcode line in the previewer
            if (linesToDraw && linesToDraw.length) {
              if (is3DGraph) {
                draw3DGcodeLinesOnGraph(
                  linesToDraw,
                  this.graphSettings.GcodeCommandsColor
                );
              } else {
                draw2DGcodeLinesOnGraph(
                  linesToDraw,
                  this.graphSettings.GcodeCommandsColor
                );
              }

              this.gcodeJobSVGString += convertLinesToSVGElements(
                linesToDraw,
                this.graphSettings.GcodeCommandsColor,
                getPlatformDimensions(config),
                this.graphSettings.startPoint
              );
            }

            // when the webworker finish parsing all gcode lines it will send done message
            if (done) {
              this.isGraphLoading = false;
              this.graphSettings.startPoint = startPoint;
              this.previewWebWorker?.terminate();
              this.previewWebWorker = null;
              resolve();
            }
          });

          this.previewWebWorker.addEventListener('error', (error) => {
            this.handleGcodeError(error);
            this.isGraphLoading = false;
            reject(error);
          });
        }
      });
    },

    async drawExecutedGcodeLine() {
      const config = await configurationSettings();
      if (
        config.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER ||
        config.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER
      ) {
        add2DExecutedLineToGraph(
          this.graphSettings.GcodeCommandsColor.executedLine
        );
      } else if (config.machine_type === Constants.MACHINE_TYPE.CNC) {
        add3DExecutedLineToGraph(
          this.graphSettings.GcodeCommandsColor.executedLine
        );
      }
    },
    addGridTo2DGraph() {
      add2DGrid();
    },
    addGridTo3DGraph() {
      add3DGrid();
    },
    addCameraFrameTo2DGraph() {
      add2DCameraFrame(this.cameraFrame);
    },
    addLabelsTo2DGraph() {
      add2DLabels();
    },
    removeGridTo2DGraph() {
      remove2DGrid();
    },
    removeGridTo3DGraph() {
      remove3DGrid();
    },
    removeCameraFrameTo2DGraph() {
      remove2DCameraFrame();
    },
    removeLabelsTo2DGraph() {
      remove2DLabels();
    },
    activateDragAndDropControls() {
      dragAndDropControls?.activate();
    },
    deactivateDragAndDropControls() {
      dragAndDropControls?.deactivate();
    },
    setCameraFrame(res: CameraData) {
      this.cameraFrame = `data:image/png;base64,${res.frame}`;
      if (this.graphSettings.showCamera) {
        this.addCameraFrameTo2DGraph();
      }
    },
    handleGcodeBiggerThanPlatform(is3DGraph = false) {
      if (is3DGraph) {
        this.reset3DGraph();
      } else {
        this.reset2DGraph();
      }

      this.isGcodeBiggerThanPlatform = true;
      this.debuggerStore.addLog(
        new Date(),
        Constants.JOBS_MANAGER_DATA_TYPE,
        'Preview',
        Constants.PREVIEWER_BIG_GCODE_MESSAGE
      );
    },
    handleGcodeError(error: unknown, is3DGraph = false) {
      if (is3DGraph) {
        this.reset3DGraph();
      } else {
        this.reset2DGraph();
      }

      this.isGcodeError = true;
      this.isGraphLoading = false;
      this.debuggerStore.addLog(
        new Date(),
        Constants.JOBS_MANAGER_DATA_TYPE,
        'Preview',
        (error as Error).message
      );
    },
    reset2DGraph() {
      resetAll2DGraphElements();
      remove2DExecutionLayer();
      this.gcodeJobSVGString = '';
      this.isGraphLoading = false;
      this.isGcodeBiggerThanPlatform = false;
      this.isGcodeError = false;
      this.isNewFileToDraw = true;
      this.previewWebWorker?.terminate();
      this.previewWebWorker = null;
    },
    reset3DGraph() {
      remove3DExecutionLayer();
      this.gcodeJobSVGString = '';
      this.isGraphLoading = false;
      this.isGcodeBiggerThanPlatform = false;
      this.isGcodeError = false;
      this.isNewFileToDraw = true;
      this.previewWebWorker?.terminate();
      this.previewWebWorker = null;
    },
  },
});
