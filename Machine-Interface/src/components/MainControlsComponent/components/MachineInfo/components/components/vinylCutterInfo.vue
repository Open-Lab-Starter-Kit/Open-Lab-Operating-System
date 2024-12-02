<template>
  <div class="column q-gutter-y-md">
    <div class="row items-center justify-between q-gutter-y-md">
      <span>Feed Rate</span>
      <span>{{ feedRate }} mm/s</span>
    </div>
    <div class="row items-center justify-between">
      <span>Tool Power</span>
      <span>{{ feedAndSpeed?.speed }} %</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { computed } from 'vue';

const machineStatusStore = useMachineStatusStore();
const { feedAndSpeed } = storeToRefs(machineStatusStore);

const feedRate = computed(() => {
  if (feedAndSpeed.value?.feed_rate)
    return (feedAndSpeed.value.feed_rate / 60).toFixed(2);
  else return 0;
});
</script>
