<template>
  <q-card class="row relative-position flex-center" flat bordered>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div v-if="isGcodeError" class="q-pa-md">
        <h5 class="message-text">
          {{ Constants.PREVIEWER_GCODE_ERROR_MESSAGE }}
        </h5>
      </div>
      <div v-else-if="isGcodeBiggerThanPlatform" class="q-pa-md">
        <h5 class="message-text">
          {{ Constants.PREVIEWER_BIG_GCODE_MESSAGE }}
        </h5>
      </div>
      <div
        v-else
        ref="graphContainer"
        :style="{
          border: 'solid 1px black',
        }"
      ></div>
    </transition>
    <div ref="result_threejs_3D"></div>

    <q-inner-loading :showing="isGraphLoading">
      <q-spinner-gears size="100" color="primary" />
      <p class="loading-text">Please wait...</p>
    </q-inner-loading>
  </q-card>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { useGcodePreviewStore } from 'src/stores/gcode-preview';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { onMounted, ref, watch } from 'vue';
import { Config } from 'src/interfaces/configSettings.interface';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { reset2DGraphControls } from 'src/services/draw.gcode.service/draw.gcode.2D.service';
import { reset3DGraphControls } from 'src/services/draw.gcode.service/draw.gcode.3D.service';

const gcodePreviewStore = useGcodePreviewStore();
const machineStatusStore = useMachineStatusStore();

const config = ref<Config | null>(null);

const {
  graphElement,
  isGraphLoading,
  isGcodeError,
  isGcodeBiggerThanPlatform,
} = storeToRefs(gcodePreviewStore);

const { machineState } = storeToRefs(machineStatusStore);
const graphContainer = ref<HTMLDivElement | null>(null);

watch(
  machineState,
  (newMachineState) => {
    // activate/deactivate the drag and drop controls
    if (newMachineState === Constants.IDLE) {
      gcodePreviewStore.activateDragAndDropControls();
    } else {
      gcodePreviewStore.deactivateDragAndDropControls();
    }
  },
  { immediate: true }
);

// add graphElement to the container
onMounted(async () => {
  config.value = await configurationSettings();

  if (graphContainer.value) {
    graphContainer.value.append(graphElement.value);
  }
  // reset the zoom camera
  if (
    config.value?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER ||
    config.value?.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER
  ) {
    reset2DGraphControls();
  } else {
    reset3DGraphControls();
  }
});
</script>

<style scoped>
.graph-container {
  position: relative;
  transition: 0.5s ease;
  overflow: hidden;
}
.grid-background {
  position: absolute;
  background-image: repeating-linear-gradient(grey 0 1px, transparent 1px 100%),
    repeating-linear-gradient(90deg, grey 0 1px, transparent 1px 100%);
  background-size: 50px 51px;
  border: solid 1px grey;
}
.loading-text {
  font-size: 25px;
  padding: 20px;
  z-index: 1;
}
.message-text {
  min-height: 20vh;
  text-align: center;
}
</style>
