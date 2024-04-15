<template>
  <div class="column col flex-center">
    <!-- Loading Indicator -->
    <div v-if="isLoading" class="loading-indicator column col items-center">
      <h5 class="text-center">Preview is in progress. Hang on...</h5>
      <q-spinner-dots size="40px"></q-spinner-dots>
    </div>
    <div v-if="isError">
      <h5>
        Something went wrong. Please check the debugger for more information
      </h5>
    </div>
    <div
      v-else
      ref="container"
      class="graph-container"
      @touchstart.prevent="machineState === Constants.IDLE && handleTouchStart"
      @touchmove.prevent="machineState === Constants.IDLE && handleTouchMove"
      @touchend.prevent="machineState === Constants.IDLE && handleTouchEnd"
      @wheel.prevent="handleWheelZoom"
      :style="{
        width: `${Constants.PLATFORM_WIDTH}px`,
        height: `${Constants.PLATFORM_HEIGHT}px`,
        transform: `zoomLevel(${zoomLevel})`,
        backgroundImage: showCamera ? `url(${cameraFrame})` : '', // Set background image
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }"
    >
      <!-- Grid background -->
      <div v-if="showGrid" class="grid-background fit col"></div>

      <!-- SVG Element -->
      <svg
        ref="svgElement"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        @pointerdown="handlePointerDown"
        class="svg-element"
        :style="{
          bottom: previewState.clampedY,
          left: previewState.clampedX,
          transform: `scaleY(-1)`,
        }"
      ></svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { useFileManagementStore } from 'src/stores/file-management';
import { useGcodePreview } from 'src/stores/gcode-preview';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { onMounted, ref } from 'vue';

const fileManagerStore = useFileManagementStore();
const gcodePreviewStore = useGcodePreview();
const machineStatusStore = useMachineStatusStore();

const { openedFileContent } = storeToRefs(fileManagerStore);

const { svgElement, showCamera, cameraFrame, showGrid, previewState, isError } =
  storeToRefs(gcodePreviewStore);

const { machineState } = storeToRefs(machineStatusStore);

const container = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);

let zoomLevel = 1;
const maxZoomLevel = 100;

const handlePointerMove = (e: PointerEvent) => {
  // the user can move the job only when the machine is in idle state
  if (
    container.value &&
    svgElement.value &&
    machineState.value === Constants.IDLE
  ) {
    const containerRect = container.value.getBoundingClientRect();
    const svgRect = svgElement.value.getBoundingClientRect();

    const newX =
      (e.clientX - containerRect.left - previewState.value.pointerOffsetX) /
      zoomLevel;
    const newY =
      (containerRect.bottom - e.clientY - previewState.value.pointerOffsetY) /
      zoomLevel;

    // Ensure the new position stays within the container bounds
    previewState.value.clampedX = parseFloat(
      Math.min(
        Math.max(newX, 0),
        containerRect.width / zoomLevel - svgRect.width / zoomLevel
      ).toFixed(2)
    );
    previewState.value.clampedY = parseFloat(
      Math.min(
        Math.max(newY, 0),
        containerRect.height / zoomLevel - svgRect.height / zoomLevel
      ).toFixed(2)
    );

    svgElement.value.style.left = `${previewState.value.clampedX}px`;
    svgElement.value.style.bottom = `${previewState.value.clampedY}px`;
  }
};

const handlePointerDown = (e: PointerEvent) => {
  if (container.value && svgElement.value) {
    const svgRect = svgElement.value.getBoundingClientRect();

    previewState.value.pointerOffsetX = e.clientX - svgRect.left;
    previewState.value.pointerOffsetY = e.clientY - svgRect.top;

    document.addEventListener('pointermove', handlePointerMove);
  }
};

window.onpointerup = () => {
  document.removeEventListener('pointermove', handlePointerMove);
};

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    previewState.value.lastTouchDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );
    previewState.value.isPinching = true;
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (previewState.value.isPinching && e.touches.length === 2) {
    const touchDistance = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY
    );

    const zoomLevelFactor =
      touchDistance / previewState.value.lastTouchDistance;
    previewState.value.lastTouchDistance = touchDistance;

    const newZoomLevel = zoomLevel * zoomLevelFactor;

    if (newZoomLevel >= 0.5 && newZoomLevel <= 2) {
      zoomLevel = newZoomLevel;
    }
  }
};

const handleTouchEnd = () => {
  previewState.value.isPinching = false;
};

const handleWheelZoom = (e: WheelEvent) => {
  e.preventDefault();

  if (container.value) {
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

    const rect = container.value.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const offsetX = (mouseX / rect.width) * 100;
    const offsetY = (mouseY / rect.height) * 100;

    const newZoomLevel = zoomLevel * zoomFactor;
    zoomLevel = Math.max(1, Math.min(maxZoomLevel, newZoomLevel));

    container.value.style.transformOrigin = `${offsetX}% ${offsetY}%`;
    container.value.style.transform = `scale(${zoomLevel})`;
  }
};

onMounted(() => {
  // make sure that there is already opened file
  if (openedFileContent.value) {
    // Show the loading indicator
    setTimeout(async () => {
      isLoading.value = true;
      gcodePreviewStore
        .createSVG(openedFileContent.value)
        .then(() => (isLoading.value = false)); // Hide the loading indicator
    }, 500);
  } else {
    isLoading.value = false;
  }
});
</script>

<style scoped>
.graph-container {
  position: relative;
  transition: 0.3s ease;
}
.grid-background {
  position: absolute;
  background-image: repeating-linear-gradient(grey 0 1px, transparent 1px 100%),
    repeating-linear-gradient(90deg, grey 0 1px, transparent 1px 100%);
  background-size: 50px 50px;
  border: solid 1px grey;
}

.svg-element {
  position: absolute;
  z-index: 1;
  cursor: move;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  padding: 10px;
  transform: translate(-50%, -50%);
  background-color: rgb(207, 207, 207);
  border-radius: 8px;
  z-index: 1;
}
</style>
