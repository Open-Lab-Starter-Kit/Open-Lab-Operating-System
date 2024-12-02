<template>
  <div class="q-pa-lg" style="height: 100vh">
    <div v-if="isFileOpen" class="column q-gutter-y-md">
      <main-buttons />
      <graph-component />
      <cnc-camera-stream
        v-if="
          config?.machine_type === Constants.MACHINE_TYPE.CNC &&
          config?.cnc_settings?.cameras_enabled
        "
      />
      <!-- <job-coordinates /> -->
    </div>
    <div v-else class="row fit text-center flex-center text-h4">
      There is no file opened to preview. Please try to open a file from the
      file manager to be able to preview the job.
    </div>
  </div>
</template>
<script setup lang="ts">
import MainButtons from './components/MainButtons.vue';
import CncCameraStream from './components/CncCameraStream.vue';
import GraphComponent from './components/GraphComponent.vue';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { Constants } from 'src/constants';
import { storeToRefs } from 'pinia';
import { onBeforeMount, ref, watch } from 'vue';
import { executeNormalGCommands } from 'src/services/execute.commands.service';
import { useQuasar, DialogChainObject } from 'quasar';
import { Config } from 'src/interfaces/configSettings.interface';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { useJobInfoStore } from 'src/stores/job-info';
import { useJobsFilesManagementStore } from 'src/stores/jobs-files-management';

const $q = useQuasar();
const machineStatusStore = useMachineStatusStore();
const jobInfoStore = useJobInfoStore();
const jobsFilesManagementStore = useJobsFilesManagementStore();

const { machineState, machinePosition } = storeToRefs(machineStatusStore);
const { isJobEnded } = storeToRefs(jobInfoStore);
const { isFileOpen } = storeToRefs(jobsFilesManagementStore);

const config = ref<Config | null>(null);

let parkingDialog: DialogChainObject | null = null;

const parkTheMachine = () => {
  if (
    machineState.value === Constants.IDLE &&
    machinePosition.value.z !== undefined &&
    (Math.round(machinePosition.value.y) !==
      config.value?.laser_cutter_settings?.job_previewer.parking_settings.point
        .y ||
      Math.round(machinePosition.value.z) !==
        config.value?.laser_cutter_settings?.job_previewer.parking_settings
          .point.z)
  ) {
    executeNormalGCommands(
      'G1F' +
        config.value?.laser_cutter_settings?.job_previewer.parking_settings
          .feed_rate
    );
    executeNormalGCommands(
      'G53' +
        'Z' +
        config.value?.laser_cutter_settings?.job_previewer.parking_settings
          .point.z
    );
    executeNormalGCommands(
      'G53' +
        'Y' +
        config.value?.laser_cutter_settings?.job_previewer.parking_settings
          .point.y
    );
    executeNormalGCommands(Constants.GRBL_COMMAND_RESET_ZERO_XYZ);
    machineStatusStore.resetXYZJobPosition();
    showWaitingToFinishParkingDialog();
  }
};

const showWaitingToFinishParkingDialog = () => {
  parkingDialog = $q.dialog({
    title: 'Please wait until the machine finishes parking...',
    persistent: true,
    ok: false,
    style: {
      fontSize: '10px',
      width: '50vw',
      textAlign: 'center',
    },
  });
};

// Watch for changes in machineState to hide the dialog when the machine becomes idle
watch(
  machineState,
  (newState) => {
    // after parking the machine, remove the parkingDialog
    if (
      (newState === Constants.IDLE ||
        newState === Constants.DOOR ||
        newState === Constants.ALARM) &&
      parkingDialog
    ) {
      parkingDialog.hide();
      parkingDialog = null;
    }
  },
  { immediate: true }
);

// park after job preview
watch(isJobEnded, () => parkTheMachine());

onBeforeMount(async () => {
  // apply parking the machine only for laser cutter if it is enabled
  config.value = await configurationSettings();
  if (
    config.value.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER &&
    config.value.laser_cutter_settings?.job_previewer.parking_settings
      .parking_enabled &&
    isFileOpen.value
  ) {
    parkTheMachine();
  }
});
</script>
