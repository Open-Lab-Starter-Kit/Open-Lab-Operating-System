<template>
  <div class="column q-my-sm q-pa-md bg-white full-width job-box">
    <div class="row items-center justify-between">
      <p>Job</p>
      <p>{{ openedFilename }}</p>
    </div>
    <div class="row justify-between">
      <p>Feed Rate</p>
      <p>{{ feedRate }} mm/s</p>
    </div>
    <div class="row justify-between">
      <p>Laser Power</p>
      <p>{{ feedAndSpeed?.spindle_speed }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFileManagementStore } from 'src/stores/file-management';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { computed } from 'vue';

const filesManagerStore = useFileManagementStore();
const machineStatusStore = useMachineStatusStore();

const { openedFilename } = storeToRefs(filesManagerStore);
const { feedAndSpeed } = storeToRefs(machineStatusStore);

const feedRate = computed(() => {
  if (feedAndSpeed.value?.feed_rate)
    return feedAndSpeed.value.feed_rate.toFixed(2);
  else return 0;
});
</script>

<style scoped>
.job-box {
  border-radius: 10px;

  & p {
    font-size: large;
  }
}
</style>
