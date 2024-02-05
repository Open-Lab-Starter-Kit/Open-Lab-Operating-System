import { defineStore } from 'pinia';
import { Notify } from 'quasar';
import API from 'src/services/API.service';

export const useFileManagementStore = defineStore('fileManager', {
  state: () => ({
    isFileSelected: false as boolean,
    isFileOpen: false as boolean,
    isFileExecuting: false as boolean,
    selectedFilename: '' as string,
    openedFilename: '-' as string,
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
          this.isFileOpen = true;
          this.isFileSelected = true;
        }
      } catch (error) {
        console.error('Error fetching files list:', error);
      }
    },
    async updateFilesList() {
      try {
        const res = (await API.getFilesList()).data;
        if (res.data.success) {
          this.filesList = res.data.filesList;
        }
      } catch (error) {
        console.error('Error fetching files list:', error);
      }
    },
    async startFile() {
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
      } catch (error) {
        console.error('Error opening file:', error);
      }
    },
    async openFile() {
      try {
        this.openedFilename = this.selectedFilename;
        const res = (await API.openFile(this.openedFilename)).data;
        if (res.data.success) {
          this.isFileOpen = true;
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
      } catch (error) {
        console.error('Error opening file:', error);
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
        // update the list incase there is any changes from the system side
        this.updateFilesList();
      } catch (error) {
        console.error('Error deleting file:', error);
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
        // update the list incase there is any changes from the system side
        this.updateFilesList();
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    },
  },
});
