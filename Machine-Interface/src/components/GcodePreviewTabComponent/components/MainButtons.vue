<template>
  <div class="row col-md-10 items-center justify-between">
    <div class="row col-md col-xs-6">
      <q-toggle
        v-model="graphSettings.showGrid"
        @update:model-value="handleGridToggleClick"
        color="green"
        label="Grid"
        :icon="graphSettings.showGrid ? 'grid_off' : 'grid_on'"
        class="col-md-3 col-xs-12"
        size="xs"
        name="showGrid"
        :disable="isGcodeError || isGcodeBiggerThanPlatform"
        style="z-index: 1"
      />
      <q-toggle
        v-if="config?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER"
        v-model="graphSettings.showCamera"
        @update:model-value="handleCameraToggleClick"
        color="light-blue-9"
        :icon="graphSettings.showCamera ? 'videocam_off' : 'videocam'"
        label="Camera"
        class="col-md-3 col-xs-12"
        size="xs"
        name="showCamera"
        :disable="isGcodeError || isGcodeBiggerThanPlatform"
        style="z-index: 1"
      />
      <q-toggle
        v-if="
          config?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER ||
          config?.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER
        "
        v-model="graphSettings.showLabels"
        @update:model-value="handleLabelToggleClick"
        color="deep-orange-6"
        icon="design_services"
        label="Labels"
        class="col-md-3 col-xs-12"
        size="xs"
        name="showLabel"
        :disable="isGcodeError || isGcodeBiggerThanPlatform"
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
        :disable="isGcodeError || isGcodeBiggerThanPlatform"
        :loading="isDownloadingPNG"
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
        :disable="isGcodeError || isGcodeBiggerThanPlatform"
        :loading="isDownloadingSVG"
        style="z-index: 1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useJobsFilesManagementStore } from 'src/stores/jobs-files-management';
import { useGcodePreviewStore } from 'src/stores/gcode-preview';
import { createSVGString } from 'src/services/draw.gcode.service/draw.gcode.svg.service';
import { onMounted, ref, watch } from 'vue';
import { Config } from 'src/interfaces/configSettings.interface';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { Constants } from 'src/constants';
import { getPlatformDimensions } from 'src/services/draw.gcode.service/draw.gcode.helper.service';

const gcodePreviewStore = useGcodePreviewStore();
const {
  isGcodeError,
  isGcodeBiggerThanPlatform,
  graphSettings,
  gcodeJobSVGString,
} = storeToRefs(gcodePreviewStore);

const config = ref<Config | null>(null);

const jobManagerStore = useJobsFilesManagementStore();
const { fileData } = storeToRefs(jobManagerStore);

const isDownloadingSVG = ref(false);
const isDownloadingPNG = ref(false);

watch(
  () => graphSettings.value.GcodeCommandsColor,
  async () => {
    if (
      config.value?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER ||
      config.value?.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER
    ) {
      await gcodePreviewStore.create2DGraph(fileData.value.fileContent);
    } else if (config.value?.machine_type === Constants.MACHINE_TYPE.CNC) {
      await gcodePreviewStore.create3DGraph(fileData.value.fileContent);
    }
  }
);

const handleGridToggleClick = (newShowGrid: boolean) => {
  if (newShowGrid) {
    if (
      config.value?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER ||
      config.value?.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER
    ) {
      gcodePreviewStore.addGridTo2DGraph();
    } else if (config.value?.machine_type === Constants.MACHINE_TYPE.CNC) {
      gcodePreviewStore.addGridTo3DGraph();
    }
  } else {
    if (
      config.value?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER ||
      config.value?.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER
    ) {
      gcodePreviewStore.removeGridTo2DGraph();
    } else if (config.value?.machine_type === Constants.MACHINE_TYPE.CNC) {
      gcodePreviewStore.removeGridTo3DGraph();
    }
  }
};

const handleCameraToggleClick = (newShowCamera: boolean) => {
  if (newShowCamera) {
    gcodePreviewStore.addCameraFrameTo2DGraph();
  } else {
    gcodePreviewStore.removeCameraFrameTo2DGraph();
  }
};

const handleLabelToggleClick = (newShowLabels: boolean) => {
  if (newShowLabels) {
    gcodePreviewStore.addLabelsTo2DGraph();
  } else {
    gcodePreviewStore.removeLabelsTo2DGraph();
  }
};

const convertSvgToImage = () => {
  // Get the SVG element as a string
  if (config.value) {
    const svgString = createSVGString(
      gcodeJobSVGString.value,
      getPlatformDimensions(config.value)
    );

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
    isDownloadingPNG.value = true;
    // When the image loads
    svgImage.onload = () => {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d', { alpha: true });

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
        downloadLink.download = fileData.value.fileName + '.png'; // Filename for the downloaded image
        downloadLink.click(); // Trigger the click event to start the download
        isDownloadingPNG.value = false;
      }
    };
  }
};

const downloadSVG = async () => {
  isDownloadingSVG.value = true;
  if (config.value) {
    const svgString = createSVGString(
      gcodeJobSVGString.value,
      getPlatformDimensions(config.value)
    );

    // Create a Blob object from the SVG content
    const blob = new Blob([svgString], {
      type: 'image/svg+xml',
    });

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileData.value.fileName + '.svg';

    // Trigger download
    link.click();

    isDownloadingSVG.value = false;
  }
};

onMounted(async () => (config.value = await configurationSettings()));
</script>
src/stores/job-files-management
