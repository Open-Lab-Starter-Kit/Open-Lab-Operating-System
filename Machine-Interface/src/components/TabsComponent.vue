<template>
  <q-list class="column fit full-width justify-center">
    <template v-for="(navItem, index) in navList" :key="index">
      <q-item
        :clickable="!isFileManagerDisabled || navItem.label !== 'File Manager'"
        :active="tabsStore.isActiveTab(navItem)"
        @click="tabsStore.changeTab(navItem)"
        class="col-grow q-pa-sm"
        active-class="active-tab"
      >
        <q-item-section
          :class="{
            'column flex-center text-center': true,
            disabled: isFileManagerDisabled && navItem.label === 'File Manager',
          }"
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
import { storeToRefs } from 'pinia';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { Constants } from 'src/constants';
import { onMounted, ref, watch } from 'vue';

const tabsStore = useTabsStore();
const machineStore = useMachineStatusStore();

const { navList } = storeToRefs(tabsStore);
const { machineState } = storeToRefs(machineStore);

const isFileManagerDisabled = ref(false);

// Disable the file manager when the machine is running
const checkIfFileManagerDisabled = (state: string) => {
  if (state === Constants.RUN || state === Constants.HOLD) {
    isFileManagerDisabled.value = true;
  } else isFileManagerDisabled.value = false;
};

// Watch for changes in machineState
watch(machineState, (newState) => {
  if (newState) {
    checkIfFileManagerDisabled(newState);
  }
});

// check if the file is executing on mount
onMounted(() => {
  if (machineState.value) {
    checkIfFileManagerDisabled(machineState.value);
  }
});
</script>

<style scoped>
.active-tab {
  background-color: white;
  color: black;
}
</style>
