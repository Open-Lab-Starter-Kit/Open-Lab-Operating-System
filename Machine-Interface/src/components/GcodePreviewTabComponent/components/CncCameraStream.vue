<template>
  <div class="row q-gutter-md">
    <u class="row text-h5 text-bold">Webcam Stream:</u>
    <canvas
      v-if="cameraFrame"
      ref="webcamCanvas"
      width="600"
      height="400"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useGcodePreviewStore } from 'src/stores/gcode-preview';
import { ref, watch } from 'vue';

const webcamCanvas = ref<HTMLCanvasElement | null>(null);

const gcodePreviewStore = useGcodePreviewStore();
const { cameraFrame } = storeToRefs(gcodePreviewStore);

watch(cameraFrame, (newCameraFrame) => {
  if (newCameraFrame && webcamCanvas.value) {
    const context = webcamCanvas.value.getContext('2d');
    const img = new Image();
    img.style.width = '100px';
    img.style.height = '100px';

    img.onload = function () {
      if (webcamCanvas.value)
        context?.drawImage(
          img,
          0,
          0,
          webcamCanvas.value.width,
          webcamCanvas.value.height
        );
    };
    img.src = newCameraFrame;
  } else {
  }
});
</script>
