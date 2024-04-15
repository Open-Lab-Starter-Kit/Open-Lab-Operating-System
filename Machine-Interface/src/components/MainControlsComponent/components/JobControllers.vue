<template>
  <div class="row q-my-sm justify-evenly full-width">
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
import { useFileManagementStore } from 'src/stores/file-management';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { Constants } from 'src/constants';
import {
  executeNormalGCommands,
  executeRealTimeGCommands,
} from 'src/services/execute.commands.service';
import { ref, watch } from 'vue';
import { useOverrideSettingsStore } from 'src/stores/override-settings';
import { useGcodePreview } from 'src/stores/gcode-preview';

const fileManagerStore = useFileManagementStore();
const machineStatusStore = useMachineStatusStore();
const overrideSettingsStore = useOverrideSettingsStore();
const gcodePreviewStore = useGcodePreview();

const { isFileOpen, isFileExecuting } = storeToRefs(fileManagerStore);
const { machineState, machinePosition } = storeToRefs(machineStatusStore);
const { isLaserMode } = storeToRefs(overrideSettingsStore);
const { previewState } = storeToRefs(gcodePreviewStore);

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
    checkJobPreviewCoordinates();
    fileManagerStore.startFileExecution();
    // reset override settings when running a new file
    overrideSettingsStore.defaultFeedRate();
    if (isLaserMode.value) {
      overrideSettingsStore.defaultLaserPower();
    } else {
      overrideSettingsStore.defaultSpindleSpeed();
    }
  } else if (machineState.value === Constants.HOLD) {
    executeRealTimeGCommands(Constants.GRBL_COMMAND_RESUME);
  } else if (machineState.value === Constants.RUN) {
    executeRealTimeGCommands(Constants.GRBL_COMMAND_PAUSE);
  }
};

const checkJobPreviewCoordinates = () => {
  // if the machine position does not match
  if (
    machinePosition.value.x !== previewState.value.clampedX ||
    machinePosition.value.y !== previewState.value.clampedY ||
    machinePosition.value.z !== previewState.value.clampedZ
  ) {
    moveMachineToJobPreviewCoordinate(
      previewState.value.clampedX - machinePosition.value.x,
      previewState.value.clampedY - machinePosition.value.y,
      previewState.value.clampedZ - machinePosition.value.z
    );
  }
};

const moveMachineToJobPreviewCoordinate = (x: number, y: number, z: number) => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands('G0' + 'X' + x + 'Y' + y + 'Z' + z);
  executeNormalGCommands(Constants.COMMAND_RESET_ZERO_XYZ);
  machineStatusStore.resetXYZJobPosition();
};
</script>
src/services/execute.commands.service
