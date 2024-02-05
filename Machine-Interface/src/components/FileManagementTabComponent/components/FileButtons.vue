<template>
  <div class="row col-xs-12 col-sm-8 col-md-4 justify-end">
    <q-btn
      icon="file_open"
      label="Open File"
      text-color="black"
      :color="isFileSelected ? 'grey-4' : 'blue-grey-2'"
      :disable="!isFileSelected"
      @click="onOpenFile()"
      class="q-ma-sm"
      no-caps
      size="20px"
    />
    <q-btn
      icon="edit"
      label="Rename File"
      text-color="black"
      :color="isFileSelected ? 'grey-4' : 'blue-grey-2'"
      :disable="!isFileSelected"
      @click="onRenameFile()"
      class="q-ma-sm"
      no-caps
      size="20px"
    />
  </div>
</template>

<script setup lang="ts">
import { useFileManagementStore } from 'src/stores/file-management';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { reactive, watch } from 'vue';

const $q = useQuasar();
const store = useFileManagementStore();
const { selectedFilename, isFileSelected } = storeToRefs(store);

// fastapi calls
const onOpenFile = () => store.openFile();

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
    html: true,
    prompt: {
      model: filenameData.filename,
      isValid: (val) => val.length > 0,
      type: 'text',
      suffix: `.${filenameData.fileExtension}`,
    },
    cancel: true,
  }).onOk((data) => {
    const newFilename = data + '.' + filenameData.fileExtension;
    store.renameFile(selectedFilename.value, newFilename);
  });
};
</script>
