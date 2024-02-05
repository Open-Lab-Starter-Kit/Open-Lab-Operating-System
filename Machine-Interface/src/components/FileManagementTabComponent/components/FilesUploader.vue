<template>
  <q-uploader
    :url="getUploadFilesURL"
    ref="uploader"
    field-name="files"
    label="Upload Files (Max number of files 5)"
    multiple
    flat
    batch
    accept=".nc,.gcode,.cnc*"
    addFiles
    max-files="5"
    :max-file-size="Constants.MAX_FILE_SIZE"
    color="grey-4"
    text-color="black"
    bordered
    @rejected="onRejected"
    @finish="
      onUpload();
      resetUploader($refs);
    "
    class="full-width q-mb-lg"
  />
</template>

<script setup lang="ts">
import { Constants } from 'src/constants';
import { QUploader, useQuasar } from 'quasar';
import { useFileManagementStore } from 'src/stores/file-management';

const store = useFileManagementStore();

const $q = useQuasar();

interface RejectedFileEntry {
  failedPropValidation: string;
  file: File;
}

const getUploadFilesURL = () => {
  return process.env.FASTAPI_SERVER_URL + Constants.API_URI.FILES + 'upload';
};

const onRejected = (rejectedEntries: RejectedFileEntry[]) => {
  rejectedEntries.forEach((entry) => {
    switch (entry.failedPropValidation) {
      case 'max-files':
        $q.notify({
          type: 'negative',
          message: 'You have exceeded the maximum number of files allowed.',
        });
        break;
      case 'max-file-size':
        $q.notify({
          type: 'negative',
          message: 'The file size exceeds the maximum allowed limit.',
        });
        break;
      case 'accept':
        $q.notify({
          type: 'negative',
          message:
            'Invalid file type. Please upload files with valid extensions.',
        });
        break;
      default:
        $q.notify({
          type: 'negative',
          message: 'File upload failed for an unknown reason.',
        });
    }
  });
};

const onUpload = () => {
  store.updateFilesList();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resetUploader = (refs: any) => {
  refs.uploader.reset();
};
</script>
