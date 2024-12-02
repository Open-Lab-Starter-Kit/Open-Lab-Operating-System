<template>
  <div class="full-width q-pa-lg">
    <div
      :class="{
        disabled:
          machineState === Constants.RUN || machineState === Constants.HOLD,
      }"
    >
      <jobs-files-uploader />
      <jobs-files-table />
      <jobs-files-buttons />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMachineStatusStore } from 'src/stores/machine-status';
import { useJobsFilesManagementStore } from 'src/stores/jobs-files-management';
import { useGcodePreviewStore } from 'src/stores/gcode-preview';
import { useUSBMonitorStore } from 'src/stores/usb-monitor';
import { useTabsStore } from 'src/stores/active-tab';
import JobsFilesButtons from './components/JobsFilesButtons.vue';
import JobsFilesTable from './components/JobsFilesTable.vue';
import JobsFilesUploader from './components/JobsFilesUploader.vue';
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { useRouter } from 'vue-router';
import { watch } from 'vue';

// Get the Vue Router instance
const router = useRouter();

// Disable the buttons and the file table when the machine is running
const machineStore = useMachineStatusStore();
const tabsStore = useTabsStore();
const gcodePreviewStore = useGcodePreviewStore();
const jobManagerStore = useJobsFilesManagementStore();
const usbMonitorStore = useUSBMonitorStore();

const { machineState } = storeToRefs(machineStore);
const { navList } = storeToRefs(tabsStore);
const { fileData } = storeToRefs(jobManagerStore);
const { isUSBStorageConnected } = storeToRefs(usbMonitorStore);

// Watch for changes in machineState
watch(machineState, (newState) => {
  if (
    (newState === Constants.RUN || newState === Constants.HOLD) &&
    router.currentRoute.value.path !== '/controls'
  ) {
    tabsStore.changeTab(navList.value.controls);
  }
});

// create gcode previewer graph
watch(
  () => fileData.value.fileContent,
  () => {
    gcodePreviewStore
      .createGcodePreviewerGraph(fileData.value.fileContent)
      .then(() => {
        // incase the machine running while creating the gcode preview
        if (machineState.value !== Constants.IDLE) {
          gcodePreviewStore.deactivateDragAndDropControls();
        }
      });
  }
);

watch(isUSBStorageConnected, (newIsUSBStorageConnected) => {
  if (newIsUSBStorageConnected) {
    usbMonitorStore.showJobUSBFilesDialog();
  } else {
    usbMonitorStore.closeJobUSBFilesDialog();
  }
});
</script>

<style scoped>
.disabled {
  pointer-events: none;
  opacity: 0.1;
}
</style>
