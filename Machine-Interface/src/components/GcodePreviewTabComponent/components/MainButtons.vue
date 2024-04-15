<template>
  <div class="row col-md-10 items-center justify-between">
    <div class="row col-md col-xs-6">
      <q-toggle
        v-model="showGrid"
        color="green"
        label="Grid"
        :icon="showGrid ? 'grid_off' : 'grid_on'"
        class="col-md-3 col-xs-12"
        size="xs"
        name="showGrid"
        :disable="isError"
        style="z-index: 1"
      />
      <q-toggle
        v-model="showCamera"
        color="light-blue-9"
        :icon="showCamera ? 'videocam_off' : 'videocam'"
        label="Camera"
        class="col-md-3 col-xs-12"
        size="xs"
        name="showCamera"
        :disable="isError"
        style="z-index: 1"
      />
    </div>
    <div class="row justify-end col-md col-xs-6 q-gutter-sm">
      <q-btn
        @click="downloadPNG"
        stack
        color="green-6"
        icon="image"
        label="Download png file"
        class="col-md-3 col-xs-6"
        size="xs"
        :disable="isError"
        style="z-index: 1"
      />
      <q-btn
        @click="downloadSVG"
        stack
        color="red-9"
        icon="web_asset"
        label="Download Svg file"
        class="col-md-3 col-xs-6"
        size="xs"
        :disable="isError"
        style="z-index: 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFileManagementStore } from 'src/stores/file-management';
import { useGcodePreview } from 'src/stores/gcode-preview';

const gcodePreviewStore = useGcodePreview();
const {
  showCamera,
  svgElement,
  showGrid,

  isError,
} = storeToRefs(gcodePreviewStore);

const fileManagerStore = useFileManagementStore();
const { openedFilename } = storeToRefs(fileManagerStore);

const convertSvgToImage = () => {
  if (svgElement.value) {
    // Get the SVG element as a string
    const svgString = new XMLSerializer().serializeToString(svgElement.value);

    // Create a Blob from the SVG string
    const svgBlob = new Blob([svgString], {
      type: 'image/svg+xml',
    });

    // Create an Image object from the SVG Blob
    const svgImage = new Image();

    // Set the src of the Image object to the SVG Blob URL
    svgImage.src = URL.createObjectURL(svgBlob);

    return svgImage;
  }
};

const downloadPNG = () => {
  // Convert SVG to Image
  const svgImage = convertSvgToImage();

  if (svgImage) {
    // When the image loads
    svgImage.onload = () => {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: false });

      // Set canvas dimensions to match image
      canvas.width = svgImage.width;
      canvas.height = svgImage.height;
      if (ctx) {
        // Draw the SVG image onto the canvas
        ctx.drawImage(svgImage, 0, 0);

        // Convert canvas to data URL representing PNG
        const dataURL = canvas.toDataURL('image/png');

        // Create a temporary anchor element
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = openedFilename.value + '.png'; // Filename for the downloaded image
        downloadLink.click(); // Trigger the click event to start the download
      }
    };
  }
};

const downloadSVG = async () => {
  if (svgElement.value) {
    // Store the current style
    const style = svgElement.value.getAttribute('style');

    // Remove the styling from the svg
    svgElement.value.removeAttribute('style');

    // Create a Blob object from the SVG content
    const blob = new Blob([svgElement.value.outerHTML], {
      type: 'image/svg+xml',
    });

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = openedFilename.value + '.svg';

    // Trigger download
    link.click();

    // Reapply the stored style for the svgElement
    if (style) {
      svgElement.value.setAttribute('style', style);
    }
  }
};
</script>
<style scoped></style>
