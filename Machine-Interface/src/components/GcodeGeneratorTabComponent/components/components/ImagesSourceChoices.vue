<template>
  <h5 class="text-bold">Choice Images Source</h5>
  <div class="row flex-center q-gutter-md">
    <q-btn
      label="Browse Uploaded Images"
      color="brown-5"
      stack
      icon="search"
      size="lg"
      @click="imageFilesManagementStore.showUploadedImageFilesDialog"
    />
    <q-btn
      v-if="isUSBStorageConnected"
      label="Check USB Images Files"
      color="purple-5"
      stack
      icon="usb"
      size="lg"
      @click="usbMonitorStore.showImageUSBFilesDialog"
    />

    <div
      v-if="config?.ai_configuration.use_ai_image_generator"
      class="column items-center"
    >
      <q-btn
        label="Generate Images Using AI"
        color="blue-5"
        stack
        icon="smart_toy"
        size="lg"
        @click="aiImageGeneratorDialogStore.showAIGeneratorDialog"
      />
    </div>

    <q-btn
      label="Pick Images Files"
      color="green"
      stack
      icon="attach_file"
      size="lg"
      @click="imageFilesInput?.pickFiles()"
    >
      <q-file
        ref="imageFilesInput"
        v-model="imageFile"
        accept=".jpg,.jpeg,.png,.svg,.webp,.dxf"
        :max-file-size="Constants.MAX_IMAGE_FILE_SIZE"
        @rejected="onRejected"
        style="display: none"
        @update:model-value="imageFilesManagementStore.uploadImageFile"
      />
    </q-btn>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUSBMonitorStore } from 'src/stores/usb-monitor';
import { useAiImageGeneratorStore } from 'src/stores/ai-image-generator';
import { useImageFilesManagementStore } from 'src/stores/image-files-management';
import { ref } from 'vue';
import { QFile } from 'quasar';
import { Constants } from 'src/constants';
import { showNotifyMessage } from 'src/services/notify.messages.service';
import { RejectedFileEntry } from 'src/interfaces/imageToGcode.interface';
import { Config } from 'src/interfaces/configSettings.interface';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';

defineProps<{
  config: Config | null;
}>();

const imageFilesInput = ref<QFile | null>(null);

const aiImageGeneratorDialogStore = useAiImageGeneratorStore();
const imageFilesManagementStore = useImageFilesManagementStore();
const imageToGcodeConvertorStore = useImageToGcodeConvertor();
const usbMonitorStore = useUSBMonitorStore();

const { isUSBStorageConnected } = storeToRefs(usbMonitorStore);
const { imageFile } = storeToRefs(imageToGcodeConvertorStore);

// validation function for svg file picker
const onRejected = (rejectedEntries: RejectedFileEntry[]) => {
  rejectedEntries.forEach((entry) => {
    const notifyMessage = showNotifyMessage();

    switch (entry.failedPropValidation) {
      case Constants.UPLOAD_FILES_ERRORS.MAX_FILES.NAME:
        notifyMessage.error(Constants.UPLOAD_FILES_ERRORS.MAX_FILES.MESSAGE);
        break;
      case Constants.UPLOAD_FILES_ERRORS.MAX_FILE_SIZE.NAME:
        notifyMessage.error(
          Constants.UPLOAD_FILES_ERRORS.MAX_FILE_SIZE.MESSAGE
        );
        break;
      case Constants.UPLOAD_FILES_ERRORS.ACCEPT.NAME:
        notifyMessage.error(Constants.UPLOAD_FILES_ERRORS.ACCEPT.MESSAGE);
        break;
      case Constants.UPLOAD_FILES_ERRORS.DUPLICATE.NAME:
        notifyMessage.error(Constants.UPLOAD_FILES_ERRORS.DUPLICATE.MESSAGE);
        break;
      default:
        notifyMessage.error(Constants.UPLOAD_FILES_ERRORS.DEFAULT.MESSAGE);
    }
  });
};
</script>
