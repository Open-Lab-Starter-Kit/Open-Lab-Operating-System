<template>
  <q-uploader
    :url="getUploadFilesURL"
    ref="uploader"
    field-name="file"
    multiple
    flat
    accept=".nc,.gcode,.cnc*"
    auto-upload
    :max-file-size="Constants.MAX_FILE_SIZE"
    color="grey-4"
    text-color="black"
    @rejected="onRejected"
    class="full-width q-mb-lg bg-grey-4"
    @uploaded="onFileUpload"
  >
    <template v-slot:header="scope">
      <div
        class="row no-wrap full-width items-center justify-between q-py-sm q-px-xl q-gutter-xs"
        style="border-bottom: solid 1px"
      >
        <div class="text-h6 text-bold">Upload files</div>
        <q-btn
          icon="upload"
          size="lg"
          @click="scope.pickFiles"
          round
          dense
          flat
        >
          <q-uploader-add-trigger />
          <q-tooltip>Pick Files</q-tooltip>
        </q-btn>
      </div>
    </template>
    <template v-slot:list="scope">
      <q-list separator>
        <q-item v-for="file in scope.files" :key="file.__key" class="bg-grey-2">
          <q-item-section side>
            <q-item-label>
              {{ file.name }}
            </q-item-label>

            <q-item-label caption>
              {{ file.__sizeLabel }}
            </q-item-label>
          </q-item-section>
          <q-item-section>
            <q-linear-progress
              rounded
              size="20px"
              :value="file.__progress"
              color="light-green-4"
              class="q-mt-sm"
            />
          </q-item-section>

          <q-item-section side>
            <q-btn
              flat
              dense
              round
              icon="cancel"
              @click="scope.removeFile(file)"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </template>
  </q-uploader>
  <q-dialog v-model="uploadedFilesDialog" seamless transition-show="fade">
    <q-card class="scroller">
      <q-separator />

      <q-card-section style="max-height: 30vh" class="scroll">
        <p v-for="(file, n) in uploadedFilesList" :key="n">
          {{ file.name }} loaded successfully
        </p>
      </q-card-section>

      <q-separator />

      <q-card-actions align="center">
        <q-btn label="OK" color="primary" @click="closeDialog" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { Constants } from 'src/constants';
import { QUploader, useQuasar } from 'quasar';
import { ref } from 'vue';
import { useDebuggerDialogStore } from 'src/stores/debugger-dialog';

const $q = useQuasar();
const store = useDebuggerDialogStore();

// Define a reference to the uploader component
const uploader = ref<QUploader | null>(null);

const uploadedFilesDialog = ref(false);
const uploadedFilesList = ref<File[]>([]);

interface RejectedFileEntry {
  failedPropValidation: string;
  file: File;
}

const getUploadFilesURL = () => {
  return process.env.FASTAPI_SERVER_URL + Constants.API_URI.FILES + 'upload';
};

const onRejected = (rejectedEntries: RejectedFileEntry[]) => {
  rejectedEntries.forEach((entry) => {
    let message;
    switch (entry.failedPropValidation) {
      case 'max-files':
        message = 'You have exceeded the maximum number of files allowed.';
        $q.notify({
          type: 'negative',
          message,
        });
        break;
      case 'max-file-size':
        message = 'The file size exceeds the maximum allowed limit.';
        $q.notify({
          type: 'negative',
          message,
        });
        break;
      case 'accept':
        message =
          'Invalid file type. Please upload files with valid extensions.';
        $q.notify({
          type: 'negative',
          message,
        });
        break;
      case 'duplicate':
        message = 'You can not upload the same file twice';
        $q.notify({
          type: 'negative',
          message,
        });
        break;
      default:
        message = 'File upload failed for an unknown reason.';
        $q.notify({
          type: 'negative',
          message,
        });
    }
    store.addLog(
      new Date(),
      Constants.FILE_MANAGER_DATA_TYPE,
      'Upload',
      message
    );
  });
};

const onFileUpload = (info: {
  files: readonly File[];
  xhr: XMLHttpRequest;
}) => {
  if (uploader.value) {
    const file = info.files[0];
    // Remove the uploaded file from the uploader component
    uploader.value.removeFile(file);
    // show the dialog
    if (uploadedFilesDialog.value === false) uploadedFilesDialog.value = true;

    uploadedFilesList.value.push(file);
    store.addLog(
      new Date(),
      Constants.FILE_MANAGER_DATA_TYPE,
      'Upload',
      file.name + ' File Uploaded successfully'
    );
  }
};

const closeDialog = () => {
  uploadedFilesDialog.value = false;
  uploadedFilesList.value = [];
};
</script>
<style scoped>
.scroller {
  position: absolute;
  bottom: 5%;
  left: 10%;
  background-color: white;
}
</style>
