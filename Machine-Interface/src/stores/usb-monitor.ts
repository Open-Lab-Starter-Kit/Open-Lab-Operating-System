import { defineStore } from 'pinia';
import {
  USBFileData,
  USBJobMonitorData,
} from 'src/interfaces/usbMonitor.interface';
import { Dialog } from 'quasar';
import USBJobFilesDialog from 'src/components/JobsFilesManagementTabComponent/components/components/USBJobFilesDialog.vue';
import USBImageFilesDialog from 'src/components/GcodeGeneratorTabComponent/components/components/USBImageFilesDialog.vue';

export const useUSBMonitorStore = defineStore('usbMonitor', {
  state: () => ({
    isJobUSBFilesDialogShown: false as boolean,
    isUSBImageFilesDialogShown: false as boolean,
    isUSBStorageConnected: false as boolean,
    usbDeviceName: '' as string,
    usbJobFilesListData: [] as USBFileData[],
    usbImageFilesListData: [] as USBFileData[],
  }),
  actions: {
    updateUSBMonitorStatus(res: USBJobMonitorData) {
      this.isUSBStorageConnected = res.is_connected;
      this.usbDeviceName = res.device_name;
      this.usbJobFilesListData = res.job_files_data;
      this.usbImageFilesListData = res.image_files_data;
    },
    showJobUSBFilesDialog() {
      this.isJobUSBFilesDialogShown = true;
      Dialog.create({
        component: USBJobFilesDialog,
      });
    },
    closeJobUSBFilesDialog() {
      this.isJobUSBFilesDialogShown = false;
    },
    showImageUSBFilesDialog() {
      this.isUSBImageFilesDialogShown = true;
      Dialog.create({
        component: USBImageFilesDialog,
      });
    },
    closeImageUSBFilesDialog() {
      this.isUSBImageFilesDialogShown = false;
    },
    checkIfDeletedFileExistInUSBJobFiles(filename: string) {
      // incase the user delete file from system that already uploaded from usb, then they can reupload it from the usb
      const usbJobFile = this.usbJobFilesListData.find(
        (file) => file.file === filename
      );
      if (usbJobFile) {
        usbJobFile.uploaded = false;
      }
    },
    checkIfDeletedImageExistInUSBImageFiles(imageName: string) {
      // incase the user delete file from system that already uploaded from usb, then they can reupload it from the usb
      const usbImageFile = this.usbImageFilesListData.find(
        (image) => image.file === imageName
      );
      if (usbImageFile) {
        usbImageFile.uploaded = false;
      }
    },
  },
});
