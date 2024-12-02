<template>
  <div class="row col-xs-12 col-sm-8 col justify-between">
    <q-btn
      v-if="isUSBStorageConnected"
      icon="usb"
      label="Check USB Jobs Files"
      text-color="black"
      color="grey-4"
      class="q-ma-sm"
      size="25px"
      @click="usbMonitorStore.showJobUSBFilesDialog"
    />
    <div class="row col justify-end">
      <q-btn
        icon="edit_square"
        label="Rename Job"
        text-color="black"
        :color="isFileSelected ? 'grey-4' : 'blue-grey-2'"
        :disable="!isFileSelected"
        @click="onRenameFile"
        class="q-ma-sm"
        size="25px"
      />
      <q-btn
        icon="file_open"
        label="Open Job"
        text-color="black"
        :color="isFileSelected ? 'grey-4' : 'blue-grey-2'"
        :disable="!isFileSelected"
        @click="onOpenFile()"
        class="q-ma-sm"
        size="25px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJobsFilesManagementStore } from 'src/stores/jobs-files-management';
import { useUSBMonitorStore } from 'src/stores/usb-monitor';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { ref, onMounted, reactive, watch } from 'vue';
import { showNotifyMessage } from 'src/services/notify.messages.service';
import { Constants } from 'src/constants';

const $q = useQuasar();

const notifyMessage = showNotifyMessage();
const jobManagerStore = useJobsFilesManagementStore();
const usbMonitorStore = useUSBMonitorStore();

const { filesListData, selectedFilename, isFileSelected } =
  storeToRefs(jobManagerStore);
const { isUSBStorageConnected } = storeToRefs(usbMonitorStore);

// fastapi calls
const onOpenFile = () => {
  jobManagerStore
    .openFile()
    .then(async () => {
      notifyMessage.success(Constants.API_SUCCESS_MESSAGES.OPEN_MESSAGE);
    })
    .catch((error) => {
      notifyMessage.error(error.message);
    });
};

// Create a reactive object to hold filename-related data
const filenameData = reactive({
  selectedFilename,
  filename: '',
  fileExtension: '',
});

// Function to update filename and fileExtension based on selectedFilename
const updateFileInfo = () => {
  const fullFileName = filenameData.selectedFilename;
  const fileNameParts = fullFileName.split('.');
  filenameData.filename = fileNameParts[0];
  filenameData.fileExtension =
    fileNameParts.length > 1 ? fileNameParts[fileNameParts.length - 1] : '';
};

// Watch for changes in selectedFilename and call updateFileInfo
watch(() => filenameData.selectedFilename, updateFileInfo);

const onRenameFile = () => {
  $q.dialog({
    title: 'Rename File',
    color: 'primary',
    html: true,
    prompt: {
      model: filenameData.filename,
      rules: [
        (val) => !!val || '* Required',
        (val) =>
          !filesListData.value.find(
            (file) => `${val}.${filenameData.fileExtension}` === file.file
          ) || 'Job name already exist',
      ],
      isValid: (val) => {
        // make sure it is not an already file name from the files list
        if (
          val.length > 0 &&
          !filesListData.value.find(
            (file) => `${val}.${filenameData.fileExtension}` === file.file
          )
        ) {
          return true;
        }
        return false;
      },
      type: 'text',
      suffix: `.${filenameData.fileExtension}`,
    },
    cancel: true,
  }).onOk((data) => {
    const newFilename = data + '.' + filenameData.fileExtension;
    jobManagerStore
      .renameFile(selectedFilename.value, newFilename)
      .then(() => {
        notifyMessage.success(Constants.API_SUCCESS_MESSAGES.RENAME_MESSAGE);
      })
      .catch((error) => {
        notifyMessage.error(error.message);
      });
  });
};

// Update file info on first mount
onMounted(() => updateFileInfo());
</script>
