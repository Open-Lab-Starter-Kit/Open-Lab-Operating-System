<template>
  <div class="column q-gutter-y-md">
    <div class="row items-center justify-between">
      <span>Feed Rate</span>
      <span>{{ feedRate }} mm/s</span>
    </div>
    <div class="row items-center justify-between">
      <span>Laser Power</span>
      <span>{{ feedAndSpeed?.speed }}%</span>
    </div>
    <div class="row items-center justify-between">
      <span>Laser Tool</span>
      <span>{{ laserTool }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Config, Tool } from 'src/interfaces/configSettings.interface';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { computed } from 'vue';

const machineStatusStore = useMachineStatusStore();
const { feedAndSpeed, machineTool } = storeToRefs(machineStatusStore);

const props = defineProps<{
  config: Config;
}>();

const feedRate = computed(() => {
  if (feedAndSpeed.value?.feed_rate)
    return (feedAndSpeed.value.feed_rate / 60).toFixed(2);
  else return 0;
});

const laserTool = computed(() => {
  if (props.config.laser_cutter_settings) {
    const tools = props.config.laser_cutter_settings.tools as Tool[];
    for (let [index, tool] of Object.values(tools).entries()) {
      if (machineTool.value === index) {
        return tool.name;
      }
    }
  }
  return '-';
});
</script>
src/interfaces/configSettings.interface
