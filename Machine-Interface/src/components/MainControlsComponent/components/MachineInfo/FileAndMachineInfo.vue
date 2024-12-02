<template>
  <div class="column q-pa-md bg-white full-width job-box">
    <div v-if="config?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER">
      <file-info />
      <q-separator class="q-my-md" />
    </div>
    <machine-info :config="config" />
  </div>
</template>

<script setup lang="ts">
import { Config } from 'src/interfaces/configSettings.interface';
import FileInfo from './components/FileInfo.vue';
import MachineInfo from './components/MachineInfo.vue';
import { Constants } from 'src/constants';

defineProps<{
  config: Config | null;
}>();
</script>

<style scoped>
.job-box {
  border-radius: 10px;
}
</style>
