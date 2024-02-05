<template>
  <xy-jogging-buttons :is-disabled="isJoggingButtonsDisabled()" />
  <z-jogging-buttons :is-disabled="isJoggingButtonsDisabled()" />
  <return-and-rest-buttons :is-disabled="isJoggingButtonsDisabled()" />
</template>
<script setup lang="ts">
import xyJoggingButtons from './components/XYJoggingButtons.vue';
import zJoggingButtons from './components/ZJoggingButtons.vue';
import ReturnAndRestButtons from './components/ReturnAndRestButtons.vue';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';

const store = useMachineStatusStore();
const { machineState } = storeToRefs(store);

const isJoggingButtonsDisabled = () => {
  if (machineState.value !== Constants.IDLE) return true;
  return false;
};
</script>
