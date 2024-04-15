import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import { Constants } from 'src/constants';
import API from 'src/services/API.service';
import { useDebuggerDialogStore } from './debugger-dialog';

interface WebsocketMessage {
  type: string;
  opened_file: string;
  files_list: string[];
  time: string;
}

export const useFileManagementStore = defineStore('fileManager', {
  state: () => ({
    debuggerStore: useDebuggerDialogStore(),
    isFileSelected: false as boolean,
    isFileOpen: false as boolean,
    isFileExecuting: false as boolean,
    selectedFilename: '' as string,
    openedFilename: '-' as string,
    openedFileContent: '' as string,
    filesList: [] as string[],
  }),
  actions: {
    selectFile(filename: string) {
      this.isFileSelected = true;
      this.selectedFilename = filename;
    },
    async checkOpenFile() {
      try {
        const res = (await API.checkOpenFile()).data;
        if (res.data.success && res.data.file) {
          this.openedFilename = res.data.file;
          this.selectedFilename = this.openedFilename;
          this.openedFileContent = res.data.content;

          this.isFileOpen = true;
          this.isFileSelected = true;

          this.debuggerStore.addLog(
            new Date(),
            res.type,
            res.data.process,
            res.data.file + ' ' + res.data.message
          );
        }
      } catch (error) {
        console.error('Error check open file:', error);
        this.debuggerStore.addLog(
          new Date(),
          Constants.CONNECTION_DATA_TYPE,
          Constants.FILE_MANAGER_ERRORS.CHECK_OPEN_FILE,
          error
        );
      }
    },
    async startFileExecution() {
      try {
        const res = (await API.startFile()).data;
        if (res.data.success) {
          Notify.create({
            message: res.data.message,
            icon: 'task_alt',
            color: 'green-4',
            timeout: 1000,
          });
        } else {
          Notify.create({
            message: res.data.message,
            icon: 'highlight_off',
            color: 'red',
            timeout: 1000,
          });
        }
        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.file + ' ' + res.data.message
        );
      } catch (error) {
        console.error('Error start file:', error);
        this.debuggerStore.addLog(
          new Date(),
          Constants.CONNECTION_DATA_TYPE,
          Constants.FILE_MANAGER_ERRORS.START_FILE,
          error
        );
      }
    },
    async openFile() {
      try {
        this.openedFilename = this.selectedFilename;
        const res = (await API.openFile(this.openedFilename)).data;
        if (res.data.success) {
          this.isFileOpen = true;
          this.openedFilename = res.data.file;
          this.openedFileContent = res.data.content;

          Notify.create({
            message: res.data.message,
            icon: 'task_alt',
            color: 'green-4',
            timeout: 1000,
          });
        } else {
          Notify.create({
            message: res.data.message,
            icon: 'highlight_off',
            color: 'red',
            timeout: 1000,
          });
        }
        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.file + ' ' + res.data.message
        );
      } catch (error) {
        console.error('Error open file:', error);
        this.debuggerStore.addLog(
          new Date(),
          Constants.CONNECTION_DATA_TYPE,
          Constants.FILE_MANAGER_ERRORS.OPEN_FILE,
          error
        );
      }
    },
    async deleteFile(filename: string) {
      try {
        const res = (await API.deleteFile(filename)).data;
        if (res.data.success) {
          if (filename === this.openedFilename) {
            this.openedFilename = '-';
            this.isFileOpen = false;
            this.isFileSelected = false;
            this.selectedFilename = '';
            this.openedFileContent = '';
          }
          Notify.create({
            message: res.data.message,
            icon: 'task_alt',
            color: 'green-4',
            timeout: 1000,
          });
        } else {
          Notify.create({
            message: res.data.message,
            icon: 'highlight_off',
            color: 'red',
            timeout: 1000,
          });
        }
        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.file + ' ' + res.data.message
        );
        // update the list incase there is any changes from the system side
        this.filesList = res.data.filesList;
      } catch (error) {
        console.error('Error delete file:', error);
        this.debuggerStore.addLog(
          new Date(),
          Constants.CONNECTION_DATA_TYPE,
          Constants.FILE_MANAGER_ERRORS.DELETE_FILE,
          error
        );
      }
    },
    async renameFile(oldFilename: string, newFilename: string) {
      try {
        const res = (await API.renameFile(oldFilename, newFilename)).data;
        if (res.data.success) {
          Notify.create({
            message: res.data.message,
            icon: 'task_alt',
            color: 'green-4',
            timeout: 1000,
          });
          if (oldFilename === this.openedFilename) {
            this.openedFilename = newFilename;
          }
          this.selectedFilename = newFilename;
        } else {
          Notify.create({
            message: res.data.message,
            icon: 'highlight_off',
            color: 'red',
            timeout: 1000,
          });
        }
        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.file + ' ' + res.data.message
        );
        // update the list incase there is any changes from the system side
        this.filesList = res.data.filesList;
      } catch (error) {
        console.error('Error rename file:', error);
        this.debuggerStore.addLog(
          new Date(),
          Constants.CONNECTION_DATA_TYPE,
          Constants.FILE_MANAGER_ERRORS.RENAME_FILE,
          error
        );
      }
    },
    updateFileManagerStatus(res: WebsocketMessage) {
      if (res.opened_file) {
        this.selectedFilename = res.opened_file;
        this.openedFilename = this.selectedFilename;
      }
      if (res.files_list) this.filesList = res.files_list;
    },
  },
});
