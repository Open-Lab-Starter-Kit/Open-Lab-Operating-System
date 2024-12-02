import axios, { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { Constants } from 'src/constants';
import {
  JobFileData,
  JobsManagerWebsocketData,
  OpenedJobFileData,
} from 'src/interfaces/jobsFilesManagement.interface';
import { GcodeFileSettings } from 'src/interfaces/imageToGcode.interface';
import API from 'src/services/API.service';
import { useDebuggerDialogStore } from './debugger-dialog';

export const useJobsFilesManagementStore = defineStore('jobsFilesManager', {
  state: () => ({
    debuggerStore: useDebuggerDialogStore(),
    isFileSelected: false as boolean,
    isFileOpen: false as boolean,
    isFileLoading: false as boolean,
    isFileExecuting: false as boolean,
    selectedFilename: '' as string,
    fileData: {
      fileName: '-',
      fileContent: '',
      materialName: '-',
      materialImage: '',
      materialThickness: '-',
    } as OpenedJobFileData,
    filesListData: [] as JobFileData[],
  }),
  actions: {
    selectFile(filename: string) {
      this.isFileSelected = true;
      this.selectedFilename = filename;
    },

    async checkOpenFile() {
      try {
        // wait for the file to load
        this.isFileLoading = true;
        const res = (await API.checkOpenFile()).data;

        if (res.data.fileData.fileName !== '-') {
          this.isFileOpen = true;
          this.fileData.fileName = res.data.fileData.fileName;
          this.selectedFilename = this.fileData.fileName;
          this.fileData.fileContent = res.data.fileData.fileContent;
          this.fileData.materialName = res.data.fileData.materialName;
          this.fileData.materialImage = res.data.fileData.materialImage;
          this.fileData.materialThickness = res.data.fileData.materialThickness;

          this.isFileSelected = true;
          this.debuggerStore.addLog(
            new Date(),
            res.type,
            res.data.process,
            res.data.fileData.fileName +
              ' ' +
              Constants.API_SUCCESS_MESSAGES.OPEN_MESSAGE
          );
        }

        this.filesListData = res.data.filesListData;

        // file finished loading
        this.isFileLoading = false;
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.CONNECTION_DATA_TYPE,
            Constants.JOBS_MANAGER_ERRORS.CHECK_OPEN_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.CHECK_OPEN_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async startFileExecution() {
      try {
        const res = (await API.startFile()).data;

        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.fileData.fileName +
            ' ' +
            Constants.API_SUCCESS_MESSAGES.START_MESSAGE
        );
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.CONNECTION_DATA_TYPE,
            Constants.JOBS_MANAGER_ERRORS.START_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.START_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async openFile() {
      try {
        // wait for the file to load
        this.isFileLoading = true;
        this.fileData.fileName = this.selectedFilename;

        const res = (await API.openFile(this.fileData.fileName)).data;
        this.isFileOpen = true;
        this.fileData.fileName = res.data.fileData.fileName;
        this.fileData.fileContent = res.data.fileData.fileContent;
        this.fileData.materialName = res.data.fileData.materialName;
        this.fileData.materialImage = res.data.fileData.materialImage;
        this.fileData.materialThickness = res.data.fileData.materialThickness;

        this.isFileLoading = false;
        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.fileData.fileName +
            ' ' +
            Constants.API_SUCCESS_MESSAGES.OPEN_MESSAGE
        );
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.JOBS_MANAGER_DATA_TYPE,
            Constants.JOBS_MANAGER_ERRORS.OPEN_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.OPEN_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async deleteFile(filename: string) {
      try {
        const res = (await API.deleteFile(filename)).data;
        if (filename === this.fileData.fileName) {
          this.fileData.fileName = '-';
          this.fileData.materialName = '-';
          this.fileData.materialThickness = '-';
          this.fileData.materialImage = '';
          this.isFileOpen = false;
          this.isFileSelected = false;
          this.selectedFilename = '';
          this.fileData.fileContent = '';
        }
        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.fileData.fileName +
            ' ' +
            Constants.API_SUCCESS_MESSAGES.DELETE_MESSAGE
        );
        // update the list incase there is any changes from the system side
        this.filesListData = res.data.filesListData;
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.JOBS_MANAGER_DATA_TYPE,
            Constants.JOBS_MANAGER_ERRORS.DELETE_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.DELETE_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async downloadFile(filename: string) {
      try {
        const res = await API.downloadFile(filename);
        const blob = new Blob([res.data], {
          type: res.headers['content-type'],
        }); // Create a Blob from the response data
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (filename === this.fileData.fileName) {
          this.openFile();
        }
        this.debuggerStore.addLog(
          new Date(),
          Constants.JOBS_MANAGER_DATA_TYPE,
          ' ',
          filename + ' ' + Constants.API_SUCCESS_MESSAGES.DOWNLOAD_MESSAGE
        );
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.JOBS_MANAGER_DATA_TYPE,
            Constants.JOBS_MANAGER_ERRORS.DOWNLOAD_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.DOWNLOAD_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async renameFile(oldFilename: string, newFilename: string) {
      try {
        const res = (await API.renameFile(oldFilename, newFilename)).data;

        if (oldFilename === this.fileData.fileName) {
          this.fileData.fileName = newFilename;
        }
        this.selectedFilename = newFilename;

        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.fileData.fileName +
            ' ' +
            Constants.API_SUCCESS_MESSAGES.RENAME_MESSAGE
        );
        // update the list incase there is any changes from the system side
        this.filesListData = res.data.filesListData;
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.JOBS_MANAGER_DATA_TYPE,
            Constants.JOBS_MANAGER_ERRORS.RENAME_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.RENAME_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async uploadJobFileFromUSB(filePath: string) {
      try {
        const res = (await API.uploadJobFileFromUSB(filePath)).data;
        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.fileData.fileName +
            ' ' +
            Constants.API_SUCCESS_MESSAGES.UPLOAD_MESSAGE
        );
        // update the list incase there is any changes from the system side
        this.filesListData = res.data.filesListData;
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.JOBS_MANAGER_DATA_TYPE,
            Constants.JOBS_MANAGER_ERRORS.UPLOAD_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.UPLOAD_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async generateGcodeFile(
      cuttingSVGElement: SVGGraphicsElement | null,
      markingSVGElement: SVGGraphicsElement | null,
      imageElement: HTMLImageElement | null,
      gcodeSettings: GcodeFileSettings
    ) {
      try {
        // create svg and image blobs
        const cuttingSVGBlob = cuttingSVGElement
          ? new Blob([cuttingSVGElement.outerHTML], {
              type: 'image/svg+xml',
            })
          : null;
        const markingSVGBlob = markingSVGElement
          ? new Blob([markingSVGElement.outerHTML], {
              type: 'image/svg+xml',
            })
          : null;
        const imageBlob = imageElement
          ? await fetch(imageElement.src).then((response) => response.blob())
          : null;

        const res = (
          await API.generateGcodeFile(
            cuttingSVGBlob,
            markingSVGBlob,
            imageBlob,
            gcodeSettings
          )
        ).data;

        // not empty data
        if (res.data.fileData) {
          this.debuggerStore.addLog(
            new Date(),
            res.type,
            res.data.process,
            res.data.fileData.fileName +
              ' ' +
              Constants.API_SUCCESS_MESSAGES.GENERATE_MESSAGE
          );
        }
        // update the list incase there is any changes from the system side
        this.filesListData = res.data.filesListData;
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          // client cancel http code
          if (error.response?.status === 499) {
            throw new Error('Generating gcode file process got canceled');
          }

          this.debuggerStore.addLog(
            new Date(),
            Constants.JOBS_MANAGER_DATA_TYPE,
            Constants.JOBS_MANAGER_ERRORS.GENERATE_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.GENERATE_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },
    async cancelGenerateGcodeFile() {
      try {
        await API.cancelGenerateGcodeFile();
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.JOBS_MANAGER_DATA_TYPE,
            Constants.JOBS_MANAGER_ERRORS.GENERATE_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.CANCEL_GENERATE_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },
    updateFileManagerStatus(res: JobsManagerWebsocketData) {
      if (res.opened_file) {
        this.selectedFilename = res.opened_file;
        this.fileData.fileName = this.selectedFilename;
      }
      if (res.files_list) this.filesListData = res.files_list;
    },
  },
});
