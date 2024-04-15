<template>
  <div class="full-width q-pa-lg">
    <div
      :class="{
        disabled:
          machineState === Constants.RUN || machineState === Constants.HOLD,
      }"
    >
      <files-uploader />
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
import { useRouter } from 'vue-router';
import { watch } from 'vue';
import { useTabsStore } from 'src/stores/active-tab';

// Get the Vue Router instance
const router = useRouter();

// Disable the buttons and the file table when the machine is running
const machineStore = useMachineStatusStore();
const tabsStore = useTabsStore();

const { machineState } = storeToRefs(machineStore);
const { navList } = storeToRefs(tabsStore);

// Watch for changes in machineState
watch(machineState, (newState) => {
  if (
    (newState === Constants.RUN || newState === Constants.HOLD) &&
    router.currentRoute.value.path !== '/controls'
  ) {
    tabsStore.changeTab(navList.value.controls);
  }
});
</script>

<style scoped>
.disabled {
  pointer-events: none;
  opacity: 0.1;
}
</style>
