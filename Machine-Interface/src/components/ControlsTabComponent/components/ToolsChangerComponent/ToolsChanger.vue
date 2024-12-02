<template>
  <div
    v-if="isMachineContainsToolsChanger"
    class="column full-width q-gutter-sm bg-grey-4 rounded-borders"
  >
    <span v-if="machineToolsList" class="text-bold" style="font-size: 1rem"
      >Tools Changer</span
    >
    <q-list class="row col items-center justify-evenly q-gutter-md">
      <template v-for="(tool, index) in machineToolsList" :key="index">
        <q-btn
          :label="tool.name"
          color="white"
          text-color="black"
          size="lg"
          class="col-2"
          push
          @click="toolsChangerStore.useTool(tool)"
          :disable="machineState !== Constants.IDLE"
        />
      </template>
    </q-list>
  </div>
</template>
<script setup lang="ts">
import { Config } from 'src/interfaces/configSettings.interface';
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { onMounted, ref } from 'vue';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { computed } from 'vue';
import { useToolsChangerStore } from 'src/stores/tools-changer';

const config = ref<Config | null>(null);
const machineStatusStore = useMachineStatusStore();
const toolsChangerStore = useToolsChangerStore();

const { machineState } = storeToRefs(machineStatusStore);

const isMachineContainsToolsChanger = computed(() => {
  if (
    (config.value?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER &&
      config.value.laser_cutter_settings?.tool_changer) ||
    (config.value?.machine_type === Constants.MACHINE_TYPE.CNC &&
      config.value.cnc_settings?.tool_changer)
  ) {
    return true;
  }
  return false;
});

const machineToolsList = computed(() => {
  if (config.value?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER) {
    return config.value.laser_cutter_settings?.tools;
  } else if (config.value?.machine_type === Constants.MACHINE_TYPE.CNC) {
    return config.value.cnc_settings?.tools;
  } else return [];
});

onMounted(async () => {
  config.value = await configurationSettings();
});
</script>
<style>
.button-size {
  font-size: 15px;
  width: 60px;
  height: 60px;
  padding: 5px 5px 5px 5px;
}

.small-font {
  font-size: 1.5vh;
}
.large-font {
  font-size: 20px;
  font-weight: bold;
}
</style>
src/interfaces/configSettings.interface
