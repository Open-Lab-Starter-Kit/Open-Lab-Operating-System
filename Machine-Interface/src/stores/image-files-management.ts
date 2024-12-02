import axios, { AxiosError } from 'axios';
import { defineStore } from 'pinia';
import { Dialog } from 'quasar';
import { Constants } from 'src/constants';
import { ImageFileData } from 'src/interfaces/imageFilesManagement.interface';
import API from 'src/services/API.service';
import { fileFromImageUrl } from 'src/services/image.editor.service';
import { useDebuggerDialogStore } from 'src/stores/debugger-dialog';
import UploadedImageFilesDialog from 'src/components/GcodeGeneratorTabComponent/components/components/UploadedImageFilesDialog.vue';

export const useImageFilesManagementStore = defineStore('imagesFilesManager', {
  state: () => ({
    debuggerStore: useDebuggerDialogStore(),
    isUploadedImagesDialogShown: false as boolean,
    imagesListData: [] as ImageFileData[],
  }),
  actions: {
    async uploadImageFile(imageFile: File) {
      try {
        const res = (await API.uploadImage(imageFile)).data;

        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.imageData.imageName +
            ' ' +
            Constants.API_SUCCESS_MESSAGES.UPLOAD_MESSAGE
        );

        // update the list incase there is any changes from the system side
        this.imagesListData = res.data.imagesListData;
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.IMAGES_MANAGER_DATA_TYPE,
            Constants.IMAGES_MANAGER_ERRORS.UPLOAD_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.UPLOAD_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async uploadImageFileFromUSB(imagePath: string) {
      try {
        const res = (await API.uploadImageFileFromUSB(imagePath)).data;

        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.imageData.imageName +
            ' ' +
            Constants.API_SUCCESS_MESSAGES.UPLOAD_MESSAGE
        );

        // update the list incase there is any changes from the system side
        this.imagesListData = res.data.imagesListData;
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.IMAGES_MANAGER_DATA_TYPE,
            Constants.IMAGES_MANAGER_ERRORS.UPLOAD_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.UPLOAD_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async listImages() {
      try {
        const res = (await API.listImagesData()).data;
        this.imagesListData = res.data.imagesListData;
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.IMAGES_MANAGER_DATA_TYPE,
            Constants.IMAGES_MANAGER_ERRORS.LIST_IMAGES_DATA,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.LIST_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async renameImageFile(oldImageName: string, newImageName: string) {
      try {
        const res = (await API.renameImage(oldImageName, newImageName)).data;

        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.imageData.imageName +
            ' ' +
            Constants.API_SUCCESS_MESSAGES.RENAME_MESSAGE
        );
        // update the list incase there is any changes from the system side
        this.imagesListData = res.data.imagesListData;
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.IMAGES_MANAGER_DATA_TYPE,
            Constants.IMAGES_MANAGER_ERRORS.RENAME_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.RENAME_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async deleteImageFile(imageName: string) {
      try {
        const res = (await API.deleteImage(imageName)).data;

        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.imageData.imageName +
            ' ' +
            Constants.API_SUCCESS_MESSAGES.DELETE_MESSAGE
        );
        // update the list incase there is any changes from the system side
        this.imagesListData = res.data.imagesListData;
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.IMAGES_MANAGER_DATA_TYPE,
            Constants.IMAGES_MANAGER_ERRORS.DELETE_FILE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.DELETE_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    async downloadImageFile(imageName: string) {
      const image = await this.fetchImageFile(imageName);
      if (image) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(image);
        link.download = imageName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      }
    },

    async fetchImageFile(imageName: string) {
      try {
        const res = (await API.fetchImageData(imageName)).data;
        this.debuggerStore.addLog(
          new Date(),
          res.type,
          res.data.process,
          res.data.imageData.imageName +
            ' ' +
            Constants.API_SUCCESS_MESSAGES.FETCH_MESSAGE
        );
        return fileFromImageUrl(
          res.data.imageData.imageSource,
          res.data.imageData.imageName
        );
      } catch (error: AxiosError | unknown) {
        if (axios.isAxiosError(error)) {
          this.debuggerStore.addLog(
            new Date(),
            Constants.IMAGES_MANAGER_DATA_TYPE,
            Constants.IMAGES_MANAGER_ERRORS.FETCH_MESSAGE,
            error.response?.data.detail
          );
          throw new Error(
            Constants.API_ERROR_MESSAGES.FETCH_MESSAGE +
              error.response?.data.detail
          );
        }
      }
    },

    showUploadedImageFilesDialog() {
      this.isUploadedImagesDialogShown = true;
      Dialog.create({
        component: UploadedImageFilesDialog,
      });
    },

    closeUploadedImageFilesDialog() {
      this.isUploadedImagesDialogShown = false;
    },
  },
});
