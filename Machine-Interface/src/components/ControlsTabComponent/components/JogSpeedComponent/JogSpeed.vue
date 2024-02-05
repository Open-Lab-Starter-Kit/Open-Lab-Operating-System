<template>
  <div
    class="column col-md-3 col-sm-12 col-xs-12 q-pa-sm bg-grey-4 items-stretch justify-between rounded-borders"
    style="flex-grow: 1"
  >
    <span style="font-size: 1rem">Jog speed (mm/s)</span>
    <div class="column col-grow justify-center q-gutter-y-sm">
      <xy-jog-speed :is-disabled="machineState !== Constants.IDLE" />
      <z-jog-speed :is-disabled="machineState !== Constants.IDLE" />
    </div>
  </div>
</template>
<script setup lang="ts">
import xyJogSpeed from './components/XYJogSpeed.vue';
import ZJogSpeed from './components/ZJogSpeed.vue';
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { useMachineStatusStore } from 'src/stores/machine-status';

const machineStatusStore = useMachineStatusStore();

const { machineState } = storeToRefs(machineStatusStore);
</script>

<style>
.axis-title {
  font-weight: bold;
  font-size: 15px;
}
.group-button-width {
  width: 30%;
  font-size: 10px;
  height: fit-content;
}
</style>
