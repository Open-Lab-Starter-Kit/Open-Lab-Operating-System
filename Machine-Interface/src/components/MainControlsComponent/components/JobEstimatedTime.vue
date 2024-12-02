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
import { computed, onMounted, ref, watch } from 'vue';
import { Constants } from 'src/constants';

const machineStatusStore = useMachineStatusStore();
const { machineState } = storeToRefs(machineStatusStore);

const jobInfoStore = useJobInfoStore();
const { jobProgress } = storeToRefs(jobInfoStore);

const progressFileLabel = ref('');
const progressColor = ref('');

const updateJobProgress = () =>
  (progressFileLabel.value = (jobProgress.value * 100).toFixed(2) + '%');

const formatTime = computed(() => {
  const totalSeconds = jobInfoStore.jobTimer;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(seconds).padStart(2, '0')}`;
});

const checkProgressBarColor = (state: string) => {
  switch (state) {
    case Constants.IDLE:
      progressColor.value = 'light-blue-2';
      break;
    case Constants.RUN:
      progressColor.value = 'light-green-4';
      break;
    case Constants.ALARM:
      progressColor.value = 'red-4';
      break;
    case Constants.HOLD:
      progressColor.value = 'yellow-4';
      break;
    case Constants.DOOR:
      progressColor.value = 'orange-3';
      break;
    case Constants.HOMING:
      progressColor.value = 'purple-2';
      break;
    case Constants.DISCONNECTED:
      progressColor.value = 'white';
      break;
    default:
      progressColor.value = 'primary';
      break;
  }
};

// Watch for changes in jobProgress and update the progress bar
watch(jobProgress, () => {
  updateJobProgress();
});

watch(machineState, (newState) => {
  if (newState) {
    checkProgressBarColor(newState);
  }
});

onMounted(() => {
  if (machineState.value) {
    checkProgressBarColor(machineState.value);
  }
});
</script>

<style scoped>
.text-style {
  font-size: 15px;
  font-weight: bold;
}
</style>
