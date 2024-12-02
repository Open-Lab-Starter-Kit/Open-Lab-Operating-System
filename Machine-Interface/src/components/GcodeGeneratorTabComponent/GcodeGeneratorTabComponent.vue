<template>
  <div class="q-pa-lg">
    <div v-if="config" class="column q-gutter-md">
      <image-viewer :config="config" />
      <q-card bordered square flat>
        <q-splitter v-model="splitterModel">
          <template v-slot:before>
            <q-tabs
              v-model="activeTab"
              class="text-grey border-bottom"
              active-color="primary"
              active-bg-color="grey-4"
              indicator-color="primary"
              vertical
              stretch
            >
              <q-tab
                name="mapping"
                icon="grid_on"
                label="Mapping"
                :disable="imageFile === null"
              />
              <q-tab
                name="settings"
                icon="settings"
                label="Settings"
                class="col-grow"
                :disable="imageFile === null"
              />
              <q-tab
                name="materials"
                icon="library_books"
                label="Materials"
                class="col-grow"
                :disable="imageFile === null"
              />
            </q-tabs>
          </template>
          <template v-slot:after>
            <q-tab-panels
              v-model="activeTab"
              animated
              swipeable
              vertical
              transition-prev="jump-up"
              transition-next="jump-up"
            >
              <q-tab-panel name="mapping">
                <image-mapping />
              </q-tab-panel>

              <q-tab-panel name="settings">
                <gcode-file-settings :config="config" />
              </q-tab-panel>

              <q-tab-panel name="materials">
                <material-library />
              </q-tab-panel>
            </q-tab-panels>

            <h5 v-if="imageFile === null" class="text-center">
              No Images loaded yet
            </h5>
          </template>
        </q-splitter>
      </q-card>

      <generate-gcode-button />
    </div>
  </div>
</template>
<script setup lang="ts">
import ImageViewer from './components/ImageViewer.vue';
import ImageMapping from './components/ImageMapping.vue';
import materialLibrary from './components/MaterialLibrary/MaterialLibrary.vue';
import GcodeFileSettings from './components/GcodeFileSettings.vue';
import GenerateGcodeButton from './components/GenerateGcodeButton.vue';
import { onMounted, ref, watch } from 'vue';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';
import { useAiImageGeneratorStore } from 'src/stores/ai-image-generator';
import { useMaterialLibraryStore } from 'src/stores/material-library';
import { storeToRefs } from 'pinia';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { Config } from 'src/interfaces/configSettings.interface';
import { useUSBMonitorStore } from 'src/stores/usb-monitor';
import { useImageFilesManagementStore } from 'src/stores/image-files-management';

const imageToGcodeConvertorStore = useImageToGcodeConvertor();
const aiImageGeneratorDialogStore = useAiImageGeneratorStore();
const materialLibraryStore = useMaterialLibraryStore();
const imageFilesManagementStore = useImageFilesManagementStore();
const usbMonitorStore = useUSBMonitorStore();

const { imageFile, activeTab } = storeToRefs(imageToGcodeConvertorStore);
const { isUSBStorageConnected } = storeToRefs(usbMonitorStore);
const { isUploadedImagesDialogShown } = storeToRefs(imageFilesManagementStore);

const config = ref<Config | null>(null);
const splitterModel = ref(10);
watch(imageFile, (newImageFile) => {
  if (newImageFile) activeTab.value = 'mapping';
});

watch(isUSBStorageConnected, (newIsUSBStorageConnected) => {
  if (newIsUSBStorageConnected) {
    if (isUploadedImagesDialogShown.value) {
      imageFilesManagementStore.closeUploadedImageFilesDialog();
    }
    usbMonitorStore.showImageUSBFilesDialog();
  } else {
    usbMonitorStore.closeImageUSBFilesDialog();
  }
});

onMounted(async () => {
  config.value = await configurationSettings();

  // load material library data
  await materialLibraryStore.fetchMaterialLibraryData();

  // load system saved images data
  await imageFilesManagementStore.listImages();

  // load AI settings
  if (config.value?.ai_configuration.use_ai_image_generator) {
    aiImageGeneratorDialogStore.fetchAIConfigData();
  }
});
</script>
<style scoped></style>
