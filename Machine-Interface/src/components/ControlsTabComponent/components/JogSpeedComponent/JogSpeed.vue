<template>
  <div
    class="column col-md-3 col-sm-12 col-xs-12 q-pa-sm bg-grey-4 items-stretch justify-between rounded-borders"
    style="flex-grow: 1"
  >
    <span class="text-bold" style="font-size: 1rem">Jog speed (mm/s)</span>
    <div class="column col-grow justify-center q-gutter-y-sm">
      <xy-jog-speed :is-disabled="machineState !== Constants.IDLE" />
      <z-jog-speed
        v-if="config?.machine_type !== Constants.MACHINE_TYPE.VINYL_CUTTER"
        :is-disabled="machineState !== Constants.IDLE"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import xyJogSpeed from './components/XYJogSpeed.vue';
import ZJogSpeed from './components/ZJogSpeed.vue';
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { Config } from 'src/interfaces/configSettings.interface';
import { useMachineStatusStore } from 'src/stores/machine-status';

const machineStatusStore = useMachineStatusStore();

const { machineState } = storeToRefs(machineStatusStore);

defineProps<{
  config: Config | null;
}>();
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
