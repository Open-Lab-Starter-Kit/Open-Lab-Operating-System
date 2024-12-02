<template>
  <q-card class="relative-position" flat bordered>
    <transition
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <div
        ref="choicesBox"
        class="column overflow-hidden"
        :class="{
          'q-pa-lg': !showCanvas,
        }"
      >
        <q-btn
          class="remove-image"
          icon="delete"
          flat
          color="red-9"
          size="lg"
          @click="handleRemoveFile"
          :style="{
            visibility: showCanvas ? 'visible' : 'hidden',
          }"
        />
        <div ref="imageInputDiv" class="column items-center">
          <images-source-choices :config="config" />
        </div>

        <div
          ref="result"
          class="result-container self-center"
          @wheel="handleWheelZoom"
          @touchstart="handleTouchZoom"
          :hidden="!showCanvas"
        >
          <div id="stageContainer" class="zoom-container"></div>
        </div>
      </div>
    </transition>

    <q-inner-loading :showing="isCanvasLoading">
      <q-spinner-gears size="100" color="primary" />
      <p class="text-h5 q-pa-md">Please wait...</p>
    </q-inner-loading>

    <image-settings-box
      :hidden="!showCanvas"
      :imageMetrics="imageMetrics"
      :stage-config="stageConfig"
      :config="config"
      :update-metrics="updateMetricsManually"
      :restore-default-metrics="restoreDefaultMetrics"
      :change-enabled-transformation-anchors="
        changeEnabledTransformationAnchors
      "
    />
  </q-card>
</template>
<script setup lang="ts">
import ImageSettingsBox from 'src/components/GcodeGeneratorTabComponent/components/components/ImageSettingsBox.vue';
import ImagesSourceChoices from 'src/components/GcodeGeneratorTabComponent/components/components/ImagesSourceChoices.vue';
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import {
  convertDXFToSVGDataURI,
  drawSVGOnCanvas,
  postProcessSvgDataURI,
} from 'src/services/svg.editor.service';
import { drawImageOnCanvas } from 'src/services/image.editor.service';
import { clearFilteredSVGArrays } from 'src/services/svg.parse.service';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';
import { useMaterialLibraryStore } from 'src/stores/material-library';
import { onMounted, ref, watch } from 'vue';
import { ImageMetrics } from 'src/interfaces/imageToGcode.interface';
import { Config } from 'src/interfaces/configSettings.interface';
import Konva from 'konva';
import { Box } from 'konva/lib/shapes/Transformer';
import { getPlatformDimensions } from 'src/services/draw.gcode.service/draw.gcode.helper.service';

let zoomLevel = 1;
const maxZoomLevel = 10;

const choicesBox = ref<HTMLDivElement | null>(null);
const imageInputDiv = ref<HTMLDivElement | null>(null);
const result = ref<HTMLElement | null>(null);
const showCanvas = ref<boolean>(false);

// konva elements
const stageContainer = ref<Konva.Stage | null>(null);
const layerContainer = ref<Konva.Layer | null>(null);
const imageNode = ref<Konva.Image>();
const transformerNode = ref<Konva.Transformer>();
const stageConfig = ref<Konva.StageConfig>({
  container: 'stageContainer',
  width: 0,
  height: 0,
});

const imageMetrics = ref<ImageMetrics>({
  x: 0,
  y: 0,
  scaleX: 0,
  scaleY: 0,
  width: 0,
  height: 0,
  rotation: 0,
});

const originalImageConfig = ref<Konva.ImageConfig | null>(null);

const materialLibraryStore = useMaterialLibraryStore();
const imageToGcodeConvertorStore = useImageToGcodeConvertor();
const {
  imageFile,
  imageContent,
  modifiedImage,
  modifiedSVGCutting,
  modifiedSVGMarking,
  isCanvasLoading,
  svgElementsToModify,
  gcodeSettings,
  imageConfig,
} = storeToRefs(imageToGcodeConvertorStore);

const props = defineProps<{
  config: Config | null;
}>();

const handleWheelZoom = (e: WheelEvent) => {
  e.preventDefault();
  if (result.value) {
    handleZoom(e.deltaY, e.clientX, e.clientY);
  }
};

const handleTouchZoom = (e: TouchEvent) => {
  if (e.cancelable) {
    e.preventDefault();
  }

  if (result.value) {
    const touches = e.touches;
    if (touches.length === 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      let prevTouchDistance = Math.sqrt(
        Math.pow(touch1.clientX - touch2.clientX, 2) +
          Math.pow(touch1.clientY - touch2.clientY, 2)
      );

      const handleTouchMove = (moveEvent: TouchEvent) => {
        const moveTouches = moveEvent.touches;
        if (moveTouches.length === 2) {
          const moveTouch1 = moveTouches[0];
          const moveTouch2 = moveTouches[1];
          const touchDistance = Math.sqrt(
            Math.pow(moveTouch1.clientX - moveTouch2.clientX, 2) +
              Math.pow(moveTouch1.clientY - moveTouch2.clientY, 2)
          );
          const deltaY = touchDistance - prevTouchDistance;
          handleZoom(
            -deltaY,
            (moveTouch1.clientX + moveTouch2.clientX) / 2,
            (moveTouch1.clientY + moveTouch2.clientY) / 2
          );
          prevTouchDistance = touchDistance;
        }
      };

      const handleTouchEnd = () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
  }
};

const handleZoom = (deltaY: number, clientX: number, clientY: number) => {
  const zoomFactor = deltaY > 0 ? 0.9 : 1.1;

  if (result.value) {
    const rect = result.value.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;

    const offsetX = (mouseX / rect.width) * 100;
    const offsetY = (mouseY / rect.height) * 100;

    const newZoomLevel = zoomLevel * zoomFactor;
    zoomLevel = Math.max(1, Math.min(maxZoomLevel, newZoomLevel)); // Ensure zoom doesn't go below 100%

    result.value.style.transformOrigin = `${offsetX}% ${offsetY}%`;
    result.value.style.transform = `scale(${zoomLevel})`;
  }
};

const handleRemoveFile = () => {
  if (imageInputDiv.value && result.value) {
    stageContainer.value = null;
    layerContainer.value = null;

    resetImageConfigurationSettings();

    imageInputDiv.value.style.display = 'flex';
    imageInputDiv.value.style.opacity = '1';
    zoomLevel = 1;
    showCanvas.value = false;
    // reset store states
    imageToGcodeConvertorStore.$reset();
  }
  // clear the svg elements filtering arrays
  clearFilteredSVGArrays();
};

const handleUploadFile = async () => {
  const processFileContent = async (fileContent: string, fileType: string) => {
    if (fileType === 'svg') {
      // Handle SVG files
      const svgData = await postProcessSvgDataURI(fileContent);

      imageContent.value = svgData.svgDataURI as string;
      // set correct dimensions
      imageConfig.value.width = svgData.svgWidth;
      imageConfig.value.height = svgData.svgHeight;
    } else if (fileType === 'dxf') {
      // Handle DXF files (convert to SVG)
      const svgContent = convertDXFToSVGDataURI(fileContent);
      const svgData = await postProcessSvgDataURI(svgContent);

      imageContent.value = svgData.svgDataURI as string;
      // set correct dimensions
      imageConfig.value.width = svgData.svgWidth;
      imageConfig.value.height = svgData.svgHeight;
    } else {
      // Handle other image files (Data URL)
      imageContent.value = fileContent;
    }
  };

  // Utility to determine file type based on the extension
  const getFileType = (fileName: string) => {
    if (fileName.endsWith('.svg')) return 'svg';
    if (fileName.endsWith('.dxf')) return 'dxf';
    return 'other'; // Default case for other image types
  };

  // Utility to read the file based on its type
  const readFile = (reader: FileReader, file: File, fileType: string) => {
    if (fileType === 'dxf') {
      reader.readAsText(file); // DXF files as text
    } else {
      reader.readAsDataURL(file); // Other files as Data URL
    }
  };

  isCanvasLoading.value = true;

  if (!imageFile.value) return;

  const file = imageFile.value;
  const reader = new FileReader();

  reader.onload = async (e: ProgressEvent<FileReader>) => {
    const fileReader = e.target as FileReader;
    if (fileReader?.result) {
      const fileContent = fileReader.result as string;
      const fileType = getFileType(file.name);
      await processFileContent(fileContent, fileType);
    }
    isCanvasLoading.value = false;
  };

  // Read the file based on its type
  const fileType = getFileType(file.name);
  readFile(reader, file, fileType);

  // set G-code settings for the new uploaded file
  materialLibraryStore.updateGcodeFileSettings();
};

const createKonvaCanvas = () => {
  // build konva canvas
  stageContainer.value = new Konva.Stage(stageConfig.value);
  layerContainer.value = new Konva.Layer();
  stageContainer.value.add(layerContainer.value as Konva.Layer);

  // define several math function
  const getCorner = (
    pivotX: number,
    pivotY: number,
    diffX: number,
    diffY: number,
    angle: number
  ) => {
    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

    /// find angle from pivot to corner
    angle += Math.atan2(diffY, diffX);

    /// get new x and y and round it off to integer
    const x = pivotX + distance * Math.cos(angle);
    const y = pivotY + distance * Math.sin(angle);

    return { x: x, y: y };
  };

  const getClientRect = (rotatedBox: Box) => {
    const { x, y, width, height } = rotatedBox;
    const rad = rotatedBox.rotation;

    const p1 = getCorner(x, y, 0, 0, rad);
    const p2 = getCorner(x, y, width, 0, rad);
    const p3 = getCorner(x, y, width, height, rad);
    const p4 = getCorner(x, y, 0, height, rad);

    const minX = Math.min(p1.x, p2.x, p3.x, p4.x);
    const minY = Math.min(p1.y, p2.y, p3.y, p4.y);
    const maxX = Math.max(p1.x, p2.x, p3.x, p4.x);
    const maxY = Math.max(p1.y, p2.y, p3.y, p4.y);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  };

  // create new transformer
  transformerNode.value = new Konva.Transformer({
    anchorSize: 20,
    boundBoxFunc: (oldBox, newBox) => {
      const box = getClientRect(newBox);
      if (stageContainer.value) {
        const isOut =
          box.x < 0 ||
          box.y < 0 ||
          box.x + box.width > stageContainer.value.width() ||
          box.y + box.height > stageContainer.value.height();

        // if new bounding box is out of visible viewport, let's just skip transforming
        // this logic can be improved by still allow some transforming if we have small available space
        if (isOut) {
          return oldBox;
        }
      }
      return newBox;
    },
    anchorStyleFunc: (anchor) => {
      anchor.cornerRadius(20);
      if (anchor.hasName('top-center') || anchor.hasName('bottom-center')) {
        anchor.height(12);
        anchor.offsetY(6);
        anchor.width(60);
        anchor.offsetX(30);
      }
      if (anchor.hasName('middle-left') || anchor.hasName('middle-right')) {
        anchor.height(60);
        anchor.offsetY(30);
        anchor.width(12);
        anchor.offsetX(6);
      }
    },
  });

  layerContainer.value.add(transformerNode.value as Konva.Transformer);
};

const clearKonvaCanvas = () => {
  if (stageContainer.value && layerContainer.value && transformerNode.value) {
    stageContainer.value.clear();
    layerContainer.value.clear();

    // remove all the image nodes
    const imageNodes = layerContainer.value.find('Image'); // Find all Image nodes
    imageNodes.forEach((node) => node.destroy());

    // clear the transformer nodes
    transformerNode.value.nodes([]);
  }
};

const showSourceImageOnCanvas = async () => {
  const image = new Image();
  image.onload = () => {
    if (result.value && imageInputDiv.value && choicesBox.value) {
      result.value.style.opacity = '1';
      imageInputDiv.value.style.display = 'none';
      showCanvas.value = true;
      // check if the stage and layer for konva canvas are established or not
      if (stageContainer.value && layerContainer.value) {
        clearKonvaCanvas();
      } else {
        // limit canvas's dimensions
        setImageDimensions(image);

        createKonvaCanvas();
      }
      handleAddingImageToKonvaCanvas(image, 0);
    }
  };
  image.src = imageContent.value;
};

const createKonvaImageNode = (image: HTMLImageElement | HTMLCanvasElement) => {
  imageNode.value = new Konva.Image({
    ...imageConfig.value,
    image,
  });

  // change the width and the height for the gcode setting to match the image metrics
  gcodeSettings.value.mainSettings.metrics.width = imageConfig.value.width ?? 0;
  gcodeSettings.value.mainSettings.metrics.height =
    imageConfig.value.height ?? 0;
};

const getAllTransformerNodes = () => {
  if (transformerNode.value) {
    return transformerNode.value.getNodes();
  }
  return [];
};

const addImageToKonvaCanvas = () => {
  if (layerContainer.value && transformerNode.value && imageNode.value) {
    // add image to the layer
    layerContainer.value.add(imageNode.value);

    // Check boundaries during drag
    const checkBoundaries = () => {
      if (imageNode.value) {
        const box = imageNode.value.getClientRect();
        const absPos = imageNode.value.getAbsolutePosition();
        if (stageContainer.value) {
          // where are shapes inside bounding box of all shapes?
          const offsetX = box.x - absPos.x;
          const offsetY = box.y - absPos.y;

          // we total box goes outside of viewport, we need to move absolute position of shape
          const newAbsPos = { ...absPos };
          if (box.x < 0) {
            newAbsPos.x = -offsetX;
          }
          if (box.y < 0) {
            newAbsPos.y = -offsetY;
          }
          if (box.x + box.width > stageContainer.value.width()) {
            newAbsPos.x = stageContainer.value.width() - box.width - offsetX;
          }
          if (box.y + box.height > stageContainer.value.height()) {
            newAbsPos.y = stageContainer.value.height() - box.height - offsetY;
          }
          imageNode.value.setAbsolutePosition(newAbsPos);
        }
      }
    };

    // init config
    // save the original metrics for the image
    saveOriginalImageConfig();

    updateImageConfig();

    imageNode.value.on('dragmove', function () {
      checkBoundaries();
      updateImageConfig();
      // update all the nodes in the transformer to match the last added image
      updatedTransformerNodes();
    });

    imageNode.value.on('transform', function () {
      if (imageNode.value) {
        updateImageConfig();
        // update all the nodes in the transformer to match the last added image
        updatedTransformerNodes();
      }
    });
  }
};

const saveOriginalImageConfig = () => {
  if (!originalImageConfig.value) {
    originalImageConfig.value = { ...imageConfig.value };
  }
};
const updateImageConfig = () => {
  if (imageNode.value && props.config && stageContainer.value) {
    const imageX = imageNode.value.x();
    const imageY = imageNode.value.y();
    const imageWidth = imageNode.value.width();
    const imageHeight = imageNode.value.height();
    const imageScaleX = imageNode.value.scaleX();
    const imageScaleY = imageNode.value.scaleY();
    const imageRotation = imageNode.value.rotation();

    const { platformWidth, platformHeight } = getPlatformDimensions(
      props.config
    );

    const stageWidth = stageContainer.value.getSize().width;
    const stageHeight = stageContainer.value.getSize().height;

    imageMetrics.value.x = imageConfig.value.x = imageX;
    imageMetrics.value.y = imageConfig.value.y = imageY;

    gcodeSettings.value.mainSettings.metrics.width =
      imageConfig.value.width =
      imageMetrics.value.width =
        imageWidth;
    gcodeSettings.value.mainSettings.metrics.height =
      imageConfig.value.height =
      imageMetrics.value.height =
        imageHeight;

    imageConfig.value.scaleX = imageScaleX;
    imageConfig.value.scaleY = imageScaleY;

    imageMetrics.value.scaleX = imageScaleX * (platformWidth / stageWidth);
    imageMetrics.value.scaleY = imageScaleY * (platformHeight / stageHeight);

    gcodeSettings.value.mainSettings.metrics.scaleX =
      (imageScaleX + (imageScaleX * platformWidth) / (stageWidth * 100)) *
      (platformWidth / stageWidth);
    gcodeSettings.value.mainSettings.metrics.scaleY =
      (imageScaleY + (imageScaleY * platformHeight) / (stageHeight * 100)) *
      (platformHeight / stageHeight);

    if (imageRotation >= 0) {
      gcodeSettings.value.mainSettings.metrics.rotation = 360 - imageRotation;
      imageConfig.value.rotation = imageMetrics.value.rotation = imageRotation;
    } else {
      gcodeSettings.value.mainSettings.metrics.rotation = -imageRotation;
      imageConfig.value.rotation = imageMetrics.value.rotation =
        360 + imageRotation;
    }
  }
};

const handleAddingImageToKonvaCanvas = (
  image: HTMLImageElement | HTMLCanvasElement,
  layerLevel: number
) => {
  // Get current transformer nodes
  const allTransformerNodes = getAllTransformerNodes();
  createKonvaImageNode(image);

  if (imageNode.value) {
    addImageToKonvaCanvas();
    // Set the layer index for the image node
    imageNode.value.zIndex(layerLevel);

    // Add image to transformer by creating a new array (instead of mutating)
    const updatedTransformerNodes = [...allTransformerNodes, imageNode.value];

    transformerNode.value?.nodes(updatedTransformerNodes);
  }
};

const drawAllModifiedElements = async () => {
  // clear canvas container
  clearKonvaCanvas();

  // handle cutting image
  if (modifiedSVGCutting.value) {
    const svgCanvas = await drawSVGOnCanvas(
      modifiedSVGCutting.value,
      props.config
    );
    handleAddingImageToKonvaCanvas(svgCanvas, 1);
  }

  // handle marking image
  if (modifiedSVGMarking.value) {
    const svgCanvas = await drawSVGOnCanvas(
      modifiedSVGMarking.value,
      props.config
    );
    handleAddingImageToKonvaCanvas(svgCanvas, 1);
  }

  // handle engraving image
  if (modifiedImage.value) {
    const imageCanvas = drawImageOnCanvas(modifiedImage.value, props.config);
    handleAddingImageToKonvaCanvas(imageCanvas, 0);
  }

  // handle main image
  if (
    modifiedImage.value === null &&
    modifiedSVGCutting.value === null &&
    modifiedSVGMarking.value === null
  ) {
    // if there is no modification on the elements, just show the main source image
    showSourceImageOnCanvas();
  }
};

const updatedTransformerNodes = () => {
  getAllTransformerNodes().map((node) => {
    if (imageNode.value) {
      node.x(imageNode.value.x());
      node.y(imageNode.value.y());
      node.rotation(imageNode.value.rotation());
      node.width(imageNode.value.width());
      node.height(imageNode.value.height());
      node.scaleX(imageNode.value.scaleX());
      node.scaleY(imageNode.value.scaleY());
    }
  });
};

const resetImageConfigurationSettings = () => {
  gcodeSettings.value.mainSettings.metrics = {
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  };
  imageConfig.value = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    scaleX: 1,
    scaleY: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    draggable: true,
    image: undefined,
  };

  originalImageConfig.value = null;
};

const setImageDimensions = (image: HTMLImageElement) => {
  if (choicesBox.value) {
    let platformWidth, platformHeight;
    const dropAreaStyle = window.getComputedStyle(choicesBox.value);
    const dropAreaWidth = parseInt(dropAreaStyle.width);
    stageConfig.value.width = platformWidth = dropAreaWidth;
    stageConfig.value.height = platformHeight =
      Constants.FALLBACK_GCODE_GENERATOR_STAGE_METRICS.height;

    if (props.config) {
      platformWidth = getPlatformDimensions(props.config).platformWidth;
      platformHeight = getPlatformDimensions(props.config).platformHeight;
    }

    // Get the dimensions of the image
    const imageWidth =
      imageConfig.value.width !== 0
        ? imageConfig.value.width
        : image.width ?? 0;
    const imageHeight =
      imageConfig.value.height !== 0
        ? imageConfig.value.height
        : image.height ?? 0;

    // Initialize scale factors for width and height
    let scaleX = 1;
    let scaleY = 1;
    let isBiggerThanTheStage = false;

    // Check if the image width exceeds the stage width
    if (imageWidth && imageWidth > platformWidth) {
      scaleX = stageConfig.value.width / imageWidth;
      isBiggerThanTheStage = true;
    } else {
      scaleX = stageConfig.value.width / platformWidth;
    }

    // Check if the image height exceeds the stage height
    if (imageHeight && imageHeight > platformHeight) {
      scaleY = stageConfig.value.height / imageHeight;
      isBiggerThanTheStage = true;
    } else {
      scaleY = stageConfig.value.height / platformHeight;
    }
    // Apply the smaller scaling factor to preserve the aspect ratio
    if (isBiggerThanTheStage) {
      const scale = Math.min(scaleX, scaleY);
      scaleX = scaleY = scale;
    }

    centralizeImageInStageContainer();

    // Set the image scaling and positioning to center the image in the stage
    imageConfig.value = {
      ...imageConfig.value,
      width: imageWidth,
      height: imageHeight,
      scaleX,
      scaleY,
      offsetX: imageWidth
        ? imageWidth / 2
        : Constants.FALLBACK_GCODE_GENERATOR_STAGE_METRICS.width / 2,
      offsetY: imageHeight
        ? imageHeight / 2
        : Constants.FALLBACK_GCODE_GENERATOR_STAGE_METRICS.height / 2,
    };
  }
};

const updateMetricsManually = (metrics: ImageMetrics | Konva.ImageConfig) => {
  if (imageNode.value) {
    // update the image
    imageNode.value.scaleX(metrics.scaleX ?? 0);
    imageNode.value.scaleY(metrics.scaleY ?? 0);
    imageNode.value.rotation(metrics.rotation ?? 0);
    updateImageConfig();
    // update all the nodes in the transformer to match the last added image
    updatedTransformerNodes();
    // centralize the image after applying the manual changes
    centralizeImageInStageContainer();
  }
};

const centralizeImageInStageContainer = () => {
  // centralize image on layer
  if (stageConfig.value.width && stageConfig.value.height) {
    imageMetrics.value.x = imageConfig.value.x = stageConfig.value.width / 2;
    imageMetrics.value.y = imageConfig.value.y = stageConfig.value.height / 2;
  }
  if (imageNode.value) {
    imageNode.value.x(imageConfig.value.x ?? 0);
    imageNode.value.y(imageConfig.value.y ?? 0);
  }
};

const restoreDefaultMetrics = () => {
  if (originalImageConfig.value) {
    updateMetricsManually(originalImageConfig.value);
  }
};

const changeEnabledTransformationAnchors = (isLocked: boolean) => {
  if (isLocked) {
    transformerNode.value?.enabledAnchors([
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right',
    ]);
  } else {
    transformerNode.value?.enabledAnchors([
      'top-left',
      'top-center',
      'top-right',
      'middle-right',
      'middle-left',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ]);
  }
};

watch(
  isCanvasLoading,
  (newIsCanvasLoading) => {
    if (!newIsCanvasLoading) {
      drawAllModifiedElements();
    }
  },
  { deep: true }
);

// watch for image file changes
watch(imageFile, (newImage) => {
  if (newImage) {
    handleUploadFile();
  }
});

onMounted(() => {
  //reset viewer
  imageToGcodeConvertorStore.resetMappingTable();
  // reset modified image
  imageToGcodeConvertorStore.resetAllImageModifications();
  // reset image configuration
  imageToGcodeConvertorStore.resetImageConfiguration();
  // reset the canvas elements array
  svgElementsToModify.value = [];

  // show the main image
  showSourceImageOnCanvas();
});
</script>
<style scoped>
.remove-image {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
}
.result-container {
  opacity: 0;
  transition: 0.5s ease;
  background-color: white;
}
.zoom-container {
  transition: 0.3s ease;
  min-width: 30vw;
  /* background-color: black; */
}
</style>
