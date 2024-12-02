<template>
  <div v-if="config?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER">
    <laser-cutter-info :config="config" />
  </div>
  <div v-else-if="config?.machine_type === Constants.MACHINE_TYPE.CNC">
    <cnc-info :config="config" />
  </div>
  <div v-else-if="config?.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER">
    <vinyl-cutter-info />
  </div>
</template>
<script setup lang="ts">
import laserCutterInfo from './components/laserCutterInfo.vue';
import cncInfo from './components/cncInfo.vue';
import vinylCutterInfo from './components/vinylCutterInfo.vue';
import { Config } from 'src/interfaces/configSettings.interface';
import { Constants } from 'src/constants';

defineProps<{
  config: Config | null;
}>();
</script>
