<template>
  <div class="full-width q-pa-sm">
    <files-uploader />
    <div
      :class="{
        disabled:
          machineState === Constants.RUN || machineState === Constants.HOLD,
      }"
    >
      <files-table />
      <file-buttons />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMachineStatusStore } from 'src/stores/machine-status';
import FileButtons from './components/FileButtons.vue';
import FilesTable from './components/FilesTable.vue';
import FilesUploader from './components/FilesUploader.vue';

import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';

// disable the buttons and the file table when the machine is running
const store = useMachineStatusStore();
const { machineState } = storeToRefs(store);
</script>

<style scoped>
.disabled {
  pointer-events: none;
  opacity: 0.1;
}
</style>
