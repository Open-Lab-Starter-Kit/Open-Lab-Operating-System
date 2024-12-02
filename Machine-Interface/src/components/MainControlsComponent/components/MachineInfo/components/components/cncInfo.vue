<template>
  <div class="column q-gutter-y-md">
    <div class="row items-center justify-between q-gutter-y-md">
      <span>Feed Rate</span>
      <span>{{ feedRate }} mm/s</span>
    </div>
    <div class="row items-center justify-between">
      <span>Spindle Speed</span>
      <span>{{ feedAndSpeed?.speed }} rpm</span>
    </div>
    <div v-if="tools" class="row items-center justify-between">
      <span>Spindle Tool</span>
      <span>{{ spindleTool }}</span>
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

const tools = computed(() => {
  if (props.config.cnc_settings) {
    return props.config.cnc_settings.tools;
  }
  return [];
});

const spindleTool = computed(() => {
  if (props.config.cnc_settings) {
    const tools = props.config.cnc_settings.tools as Tool[];
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
