<template>
  <div
    class="column col-md-6 col-sm-12 col-xs-12 q-pa-sm bg-grey-4 justify-between rounded-borders"
  >
    <span class="col-2" style="font-size: 1rem">Jog Step Size(mm)</span>
    <div class="row justify-between col-1 metrics-box">
      <span>0.1</span>
      <span>1</span>
      <span>10</span>
      <span>100</span>
    </div>
    <div class="row justify-between col-9">
      <div class="row justify-center col-1 icon-box">
        <x-y-lock-button :is-disabled="machineState !== Constants.IDLE" />
      </div>
      <div class="column col q-pb-sm">
        <x-step-slider :is-disabled="machineState !== Constants.IDLE" />
        <y-step-slider :is-disabled="machineState !== Constants.IDLE" />
        <z-step-slider :is-disabled="machineState !== Constants.IDLE" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import XStepSlider from './components/XStepSlider.vue';
import YStepSlider from './components/YStepSlider.vue';
import ZStepSlider from './components/ZStepSlider.vue';
import XYLockButton from './components/XYLockButton.vue';

import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { useMachineStatusStore } from 'src/stores/machine-status';

const machineStatusStore = useMachineStatusStore();

const { machineState } = storeToRefs(machineStatusStore);
</script>

<style>
.metrics-box {
  position: relative;
  left: 12%;
  max-width: 67%;
  font-weight: bold;
}
.icon-box {
  position: relative;
  top: 15%;
}
.lock-style {
  font-size: 10px;
  max-height: 35%;
}
.custom-btn {
  font-size: 80%;
  width: 20%;
  padding: 1px;
}
.slider-width {
  max-width: 70%;
}
</style>
