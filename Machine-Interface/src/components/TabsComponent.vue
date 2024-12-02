<template>
  <q-list class="column fit justify-center">
    <template v-for="(navItem, index) in navList" :key="index">
      <q-item
        :clickable="!isTabDisabled(navItem.label)"
        :active="tabsStore.isActiveTab(navItem)"
        @click="changeTab(navItem)"
        class="col-grow q-pa-sm"
        active-class="active-tab"
        v-if="showTab(navItem)"
      >
        <q-item-section
          class="column flex-center text-center"
          :class="{ 'disabled-tab': isTabDisabled(navItem.label) }"
        >
          <q-icon :name="navItem.icon" size="lg" />
          <p>{{ navItem.label }}</p>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { useTabsStore } from 'src/stores/active-tab';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { useJobsFilesManagementStore } from 'src/stores/jobs-files-management';
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { onMounted, ref, watch } from 'vue';
import { NavTab } from 'src/interfaces/activeTabs.interface';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { Config } from 'src/interfaces/configSettings.interface';

const tabsStore = useTabsStore();
const machineStore = useMachineStatusStore();
const jobsFilesManagementStore = useJobsFilesManagementStore();

const { navList } = storeToRefs(tabsStore);
const { machineState } = storeToRefs(machineStore);
const { isFileLoading } = storeToRefs(jobsFilesManagementStore);

const config = ref<Config | null>(null);
const isFilesManagerDisabled = ref(false);
const isJobPreviewDisabled = ref(false);

const checkIfTabsDisabled = () => {
  isFilesManagerDisabled.value =
    machineState.value === Constants.RUN ||
    machineState.value === Constants.HOLD;
  isJobPreviewDisabled.value = isFileLoading.value;
};

const isTabDisabled = (label: string) => {
  if (label === 'Jobs Manager') {
    return isFilesManagerDisabled.value;
  } else if (label === 'Job Preview') {
    return isJobPreviewDisabled.value;
  }
  return false;
};

const changeTab = (navItem: NavTab) => {
  if (!isTabDisabled(navItem.label)) {
    tabsStore.changeTab(navItem);
  }
};

const showTab = (navItem: NavTab) => {
  // don't show gcode generator tab when the machine is not laser cutter
  if (
    config.value?.machine_type !== Constants.MACHINE_TYPE.LASER_CUTTER &&
    navItem.router === 'generator'
  ) {
    return false;
  }
  return true;
};

// Watch for changes in machineState
watch(
  [machineState, isFileLoading],
  () => {
    checkIfTabsDisabled();
  },
  { deep: true }
);

// Check if the tabs should be disabled on mount
onMounted(async () => {
  checkIfTabsDisabled();
  config.value = await configurationSettings();
});
</script>
<style scoped>
.active-tab {
  background-color: white;
  color: black;
}

.disabled-tab {
  pointer-events: none;
  opacity: 0.5;
}
</style>
src/interfaces/configSettings.interface src/stores/job-files-management
