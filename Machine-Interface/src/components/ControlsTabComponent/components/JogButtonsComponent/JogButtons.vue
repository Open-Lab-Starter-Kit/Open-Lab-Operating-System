<template>
  <div class="row fit q-gutter-y-sm q-pl-sm rounded-borders">
    <div class="row col bg-grey-4 q-gutter-sm q-py-sm rounded-borders">
      <xy-jogging-buttons :is-disabled="isJoggingButtonsDisabled()" />
      <z-jogging-buttons
        v-if="config?.machine_type !== Constants.MACHINE_TYPE.VINYL_CUTTER"
        :is-disabled="isJoggingButtonsDisabled()"
      />
      <return-to-zero-buttons :is-disabled="isJoggingButtonsDisabled()" />
    </div>
    <div
      class="col-md-4 col-sm-12 col-xs-12 bg-grey-4 q-gutter-sm rounded-borders"
    >
      <rest-to-zero-buttons
        :config="config"
        :is-disabled="isJoggingButtonsDisabled()"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import xyJoggingButtons from './components/XYJoggingButtons.vue';
import zJoggingButtons from './components/ZJoggingButtons.vue';
import RestToZeroButtons from './components/RestToZeroButtons.vue';
import ReturnToZeroButtons from './components/ReturnToZeroButtons.vue';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { Config } from 'src/interfaces/configSettings.interface';

const store = useMachineStatusStore();
const { machineState } = storeToRefs(store);

defineProps<{
  config: Config | null;
}>();

const isJoggingButtonsDisabled = () => {
  if (machineState.value !== Constants.IDLE) return true;
  return false;
};
</script>
