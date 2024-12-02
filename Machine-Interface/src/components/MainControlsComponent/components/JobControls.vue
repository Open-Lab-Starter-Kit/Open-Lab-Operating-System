<template>
  <div class="row justify-evenly full-width">
    <q-btn
      round
      color="white"
      text-color="black"
      :icon="startButtonStatus?.icon"
      size="30px"
      :class="[
        'q-ma-sm',
        {
          'bg-blue-grey-2': startButtonStatus?.disabled,
        },
      ]"
      :loading="isFileLoading"
      @click="startProcess()"
      :disable="startButtonStatus?.disabled"
    />
    <q-btn
      round
      color="white"
      text-color="black"
      icon="stop"
      size="30px"
      :class="[
        'q-ma-sm',
        {
          'bg-blue-grey-2': isStopBtnDisabled(),
        },
      ]"
      @click="stopProcess()"
      :disable="isStopBtnDisabled()"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useJobsFilesManagementStore } from 'src/stores/jobs-files-management';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { Constants } from 'src/constants';
import {
  executeNormalGCommands,
  executeRealTimeGCommands,
} from 'src/services/execute.commands.service';
import { onMounted, ref, watch } from 'vue';
import { useOverrideSettingsStore } from 'src/stores/override-settings';
import { useJobInfoStore } from 'src/stores/job-info';
import {
  remove2DExecutionLayer,
  xJobStartingValue,
  yJobStartingValue,
} from 'src/services/draw.gcode.service/draw.gcode.2D.service';
import { Config } from 'src/interfaces/configSettings.interface';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { remove3DExecutionLayer } from 'src/services/draw.gcode.service/draw.gcode.3D.service';
import { showNotifyMessage } from 'src/services/notify.messages.service';

const jobManagerStore = useJobsFilesManagementStore();
const machineStatusStore = useMachineStatusStore();
const overrideSettingsStore = useOverrideSettingsStore();
const jobInfoStore = useJobInfoStore();

const { isFileOpen, isFileExecuting, isFileLoading } =
  storeToRefs(jobManagerStore);
const { machineState, machinePosition } = storeToRefs(machineStatusStore);

const notifyMessage = showNotifyMessage();
const config = ref<Config | null>(null);
const getStartButtonStatus = () => {
  // file is open
  if (machineState.value === Constants.IDLE) {
    if (isFileOpen.value) {
      return {
        icon: 'play_arrow',
        disabled: false,
      };
    } else {
      return {
        icon: 'play_arrow',
        disabled: true,
      };
    }
  } else if (machineState.value === Constants.RUN) {
    return {
      icon: 'pause',
      disabled: false,
    };
  } else if (machineState.value === Constants.HOLD) {
    return {
      icon: 'mdi-play-pause',
      disabled: false,
    };
  } else if (machineState.value === Constants.DOOR) {
    return {
      icon: 'mdi-play-pause',
      disabled: false,
    };
  } else {
    return {
      icon: 'play_arrow',
      disabled: true,
    };
  }
};

const startButtonStatus = ref(getStartButtonStatus());

// Watch for changes in machine state and update the button status
watch([machineState, isFileOpen], () => {
  startButtonStatus.value = getStartButtonStatus();
});

// disable the stop button when the machine is in idle
const isStopBtnDisabled = (): boolean => {
  return (
    machineState.value === Constants.IDLE ||
    machineState.value === Constants.ALARM ||
    machineState.value === Constants.DISCONNECTED
  );
};

const stopProcess = () => {
  executeRealTimeGCommands(Constants.GRBL_COMMAND_STOP);
  isFileExecuting.value = false;
};

const startProcess = () => {
  // change the flag to true
  isFileExecuting.value = true;
  if (machineState.value === Constants.IDLE) {
    // reset override settings when running a new file
    overrideSettingsStore.defaultFeedRate();
    // start the execution
    jobManagerStore
      .startFileExecution()
      .then(() => {
        if (
          config.value?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER
        ) {
          checkJobPreviewCoordinates();
          // reset job info
          jobInfoStore.restJobProgress();
          // remove the execution layer from the previewer when start running the job
          remove2DExecutionLayer();
          overrideSettingsStore.defaultLaserPower();
        } else if (
          config.value?.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER
        ) {
          remove2DExecutionLayer();
          overrideSettingsStore.defaultToolPower();
        } else if (config.value?.machine_type === Constants.MACHINE_TYPE.CNC) {
          remove3DExecutionLayer();
          overrideSettingsStore.defaultSpindleSpeed();
        }
      })
      .catch((error) => {
        notifyMessage.error(error.message);
      });
  } else if (
    machineState.value === Constants.HOLD ||
    machineState.value === Constants.DOOR
  ) {
    executeRealTimeGCommands(Constants.GRBL_COMMAND_RESUME);
  } else if (machineState.value === Constants.RUN) {
    executeRealTimeGCommands(Constants.GRBL_COMMAND_PAUSE);
  }
};

const checkJobPreviewCoordinates = () => {
  // if the machine position does not match
  if (
    machinePosition.value.x !== xJobStartingValue ||
    machinePosition.value.y !== yJobStartingValue
  ) {
    moveMachineToJobPreviewCoordinate(xJobStartingValue, yJobStartingValue);
  }
};

const moveMachineToJobPreviewCoordinate = (x: number, y: number) => {
  executeNormalGCommands(Constants.GRBL_COMMAND_RESET_ZERO_XYZ);
  executeNormalGCommands(
    'G92' +
      'X' +
      (machinePosition.value.x - x).toFixed(2) +
      'Y' +
      (machinePosition.value.y - y).toFixed(2)
  );
  machineStatusStore.resetXYZJobPosition();
};

onMounted(async () => {
  config.value = await configurationSettings();
});
</script>
src/stores/job-files-management src/stores/jobs-files-management
