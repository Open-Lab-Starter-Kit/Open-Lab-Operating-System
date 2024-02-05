<template>
  <div class="column q-my-sm flex-center full-width">
    <span class="text-size">Machine Position</span>
    <div class="row full-width justify-between">
      <div class="column col-xs-12 col-sm-6 col-md-4 items-center">
        <span class="text-size">X</span
        ><span class="position-metric">{{
          machinePosition?.x?.toFixed(2)
        }}</span>
      </div>
      <div class="column col-xs-12 col-sm-6 col-md-4 items-center">
        <span class="text-size">Y</span
        ><span class="position-metric">{{
          machinePosition?.y?.toFixed(2)
        }}</span>
      </div>
      <div class="column col-xs-12 col-sm-6 col-md-4 items-center">
        <span class="text-size">Z</span
        ><span class="position-metric">{{
          machinePosition?.z?.toFixed(2)
        }}</span>
      </div>
    </div>
  </div>
  <hr class="full-width" />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMachineStatusStore } from 'src/stores/machine-status';

const store = useMachineStatusStore();
const { machinePosition } = storeToRefs(store);
</script>
<style scoped>
.text-size {
  font-size: large;
  text-align: center;
}
.position-metric {
  font-size: x-large;
  font-weight: 500;
}
</style>
