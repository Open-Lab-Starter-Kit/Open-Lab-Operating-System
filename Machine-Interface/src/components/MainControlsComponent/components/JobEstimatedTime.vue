<template>
  <div class="column q-my-sm full-width">
    <div class="column items-start">
      <span class="text-style">Job Progress:</span>
      <q-linear-progress
        dark
        rounded
        instant-feedback
        size="20px"
        :value="jobProgress"
        :color="progressColor"
        class="q-mt-sm bg-white"
      >
        <div class="absolute-full flex flex-center">
          <q-badge
            color="white"
            text-color="blue-grey"
            :label="progressFileLabel"
            style="font-size: 15px"
          />
        </div>
      </q-linear-progress>
    </div>
    <div class="row q-mt-sm items-center justify-between">
      <span class="text-style">Job Timer:</span>
      <span style="color: brown" class="text-style">{{ formatTime }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useJobInfoStore } from 'src/stores/job-info';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { computed, ref, watch } from 'vue';
import { Constants } from 'src/constants';
import { useFileManagementStore } from 'src/stores/file-management';

const machineStatusStore = useMachineStatusStore();
const { machineState } = storeToRefs(machineStatusStore);

const jobInfoStore = useJobInfoStore();
const { jobProgress } = storeToRefs(jobInfoStore);

const fileManagerStore = useFileManagementStore();
const { isFileExecuting } = storeToRefs(fileManagerStore);

const progressFileLabel = ref('');

// Watch for changes in jobProgress and update the progress bar
watch(
  () => jobProgress.value,
  () => {
    updateJobProgress();
  }
);

const progressColor = computed(() => {
  // Determine the class based on machine state
  if (isFileExecuting.value) {
    switch (machineState.value) {
      case Constants.IDLE:
        return 'light-blue-3';
      case Constants.RUN:
        return 'light-green-4';
      case Constants.ALARM:
        return 'red-4';
      case Constants.HOLD:
        return 'yellow';
      case Constants.DISCONNECTED:
        return 'white';
      default:
        return 'primary';
    }
  } else {
    return 'grey';
  }
});

const updateJobProgress = () =>
  (progressFileLabel.value = (jobProgress.value * 100).toFixed(2) + '%');

const formatTime = computed(() => {
  const totalSeconds = jobInfoStore.jobTimer.totalTimeInSeconds;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;
});
</script>

<style scoped>
.text-style {
  font-size: 15px;
  font-weight: bold;
}
</style>
