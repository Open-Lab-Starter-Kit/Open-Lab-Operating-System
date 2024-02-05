<template>
  <div class="row q-my-sm justify-around full-width">
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
import { executeRealTimeGCommands } from 'src/services/controls.service';
import { WatchStopHandle, ref, watch } from 'vue';
import { useJobInfoStore } from 'src/stores/job-info';
import { useOverrideSettingsStore } from 'src/stores/override-settings';

const fileManagerStore = useFileManagementStore();
const machineStatusStore = useMachineStatusStore();
const jobInfoStore = useJobInfoStore();
const overrideSettingsStore = useOverrideSettingsStore();

const { isFileOpen, isFileExecuting } = storeToRefs(fileManagerStore);
const { machineState } = storeToRefs(machineStatusStore);
const { isJobPaused } = storeToRefs(jobInfoStore);
const { isLaserMode } = storeToRefs(overrideSettingsStore);

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
  jobInfoStore.stopJobTimer();
  executeRealTimeGCommands(Constants.GRBL_COMMAND_STOP);
  isFileExecuting.value = false;
};

const startProcess = () => {
  // change the flag to true
  isFileExecuting.value = true;
  if (machineState.value === Constants.IDLE) {
    fileManagerStore.startFile();

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

let machineStateWatch: WatchStopHandle | null = null;
watch(
  () => isFileExecuting.value,
  (newIsFileExecuting) => {
    // If file execution starts
    if (newIsFileExecuting) {
      // If there was an existing watch, stop it
      if (machineStateWatch !== null) {
        machineStateWatch();
      }

      // Start a new watch on machineState
      machineStateWatch = watch(
        () => machineState.value,
        (newMachineState) => {
          // if the machine is running
          if (machineState.value === Constants.RUN) {
            // job paused
            if (isJobPaused.value) {
              jobInfoStore.resumeJobTimer();
            } else {
              jobInfoStore.resetJobTimer();
              jobInfoStore.startJobTimer();
            }
          } else if (newMachineState === Constants.HOLD) {
            jobInfoStore.pauseJobTimer();
          }
        }
      );
    } else {
      // If file execution stops, stop the watch
      if (machineStateWatch !== null) {
        machineStateWatch();
        machineStateWatch = null;
      }
    }
  }
);
</script>
src/stores/job-controls src/services/controls.service src/stores/job-info
