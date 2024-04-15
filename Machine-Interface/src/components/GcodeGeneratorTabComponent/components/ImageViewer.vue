<template>
  <q-card class="relative-position" flat bordered>
    <q-card-section>
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div
          ref="dropArea"
          class="column q-pa-lg image-container"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          @dragover="handleDragOver"
        >
          <q-btn
            class="remove-image"
            icon="delete"
            color="red-9"
            @click="handleRemoveFile"
          />
          <div ref="imageInputDiv" class="column flex-center drop">
            <p class="q-mb-lg">Drag The Image File Here</p>

            <h6>OR</h6>
            <q-file
              v-model="imageFile"
              filled
              label="Pick an image file"
              accept=".svg,.jpg,.png,.dxf,jpeg"
              label-color="blue"
              :max-file-size="Constants.MAX_IMAGE_FILE_SIZE"
              @rejected="onRejected"
              @update:model-value="handleUploadImageFile"
            >
              <template v-slot:append>
                <q-icon name="attach_file" color="blue" />
              </template>
            </q-file>
          </div>
          <div
            ref="result"
            class="result-container self-center"
            @wheel="handleWheelZoom"
            @touchstart="handleTouchZoom"
          >
            <div ref="canvasContainer" class="zoom-container">
              <canvas ref="mainCanvas" :hidden="!showCanvas"></canvas>
            </div>
          </div>
        </div>
      </transition>
    </q-card-section>

    <q-inner-loading :showing="isCanvasLoading">
      <q-spinner-gears size="100" color="primary" />
    </q-inner-loading>
  </q-card>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { Constants } from 'src/constants';
import { clearFilteredSVGArrays } from 'src/services/svg.parse.service';
import { useImageToGcodeConvertor } from 'src/stores/image-to-gcode';
import { onMounted, ref, watch } from 'vue';

interface RejectedFileEntry {
  failedPropValidation: string;
  file: File;
}

const $q = useQuasar();

let zoomLevel = 1;
const maxZoomLevel = 4;

const mainCanvas = ref<HTMLCanvasElement | null>(null);
const dropArea = ref<HTMLDivElement | null>(null);
const imageInputDiv = ref<HTMLDivElement | null>(null);
const result = ref<HTMLInputElement | null>(null);
const canvasContainer = ref<HTMLInputElement | null>(null);
const showCanvas = ref<boolean>(false);

const imageToGcodeConvertorStore = useImageToGcodeConvertor();
const { imageFile, imageContent, modifiedImage, modifiedSVG, isCanvasLoading } =
  storeToRefs(imageToGcodeConvertorStore);

const handleDragEnter = (e: DragEvent) => {
  e.preventDefault();
  if (dropArea.value) {
    dropArea.value.style.boxShadow =
      'rgb(0 159 255 / 31%) 0px 0px 16px 8px inset';
  }
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  if (dropArea.value && imageInputDiv.value) {
    dropArea.value.style.boxShadow = 'inset 0px 0px 7px 5px #0000001f';
    imageInputDiv.value.style.opacity = '1';
  }
};
const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (imageInputDiv.value) {
    imageInputDiv.value.style.opacity = '0.5';
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

const handleWheelZoom = (e: WheelEvent) => {
  e.preventDefault();
  if (result.value) {
    handleZoom(e.deltaY, e.clientX, e.clientY);
  }
};

const handleTouchZoom = (e: TouchEvent) => {
  e.preventDefault();
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
            deltaY,
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

const handleRemoveFile = () => {
  if (canvasContainer.value && imageInputDiv.value && result.value) {
    imageInputDiv.value.style.display = 'flex';
    imageInputDiv.value.style.opacity = '1';
    zoomLevel = 1;
    showCanvas.value = false;
    mainCanvas.value = null;
    // reset store states
    imageToGcodeConvertorStore.$reset();
  }

  // clear the svg elements filtering arrays
  clearFilteredSVGArrays();
};

const handleUploadImageFile = () => {
  isCanvasLoading.value = true;
  if (imageFile.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileReader = e.target;
      if (fileReader) {
        imageContent.value = fileReader.result as string;
        showCanvas.value = true;
      }
      isCanvasLoading.value = false;
    };
    reader.readAsDataURL(imageFile.value);
  }
};

const showSourceImageOnCanvas = async () => {
  if (imageContent.value && mainCanvas.value) {
    const image = new Image();
    image.onload = () => {
      if (
        result.value &&
        canvasContainer.value &&
        imageInputDiv.value &&
        mainCanvas.value
      ) {
        // draw the offscreenCanvas and add the canvas element to the zoom container
        const imageCanvas = drawImageOnCanvas(image);
        mainCanvas.value.width = imageCanvas.width;
        mainCanvas.value.height = imageCanvas.height;
        const context = mainCanvas.value?.getContext('2d');
        context?.drawImage(imageCanvas, 0, 0);
        result.value.style.opacity = '1';
        imageInputDiv.value.style.display = 'none';
      }
    };
    image.src = imageContent.value;
  }
};

const drawAllModifiedElementsOnMainCanvas = async () => {
  if (mainCanvas.value) {
    // draw the image on canvas
    const context = mainCanvas.value.getContext('2d');
    // clear canvas
    context?.clearRect(0, 0, mainCanvas.value.width, mainCanvas.value.height);

    if (modifiedImage.value) {
      const imageCanvas = drawImageOnCanvas(modifiedImage.value);
      context?.drawImage(imageCanvas, 0, 0);
    }

    if (modifiedSVG.value) {
      const svgCanvas = await drawSVGOnCanvas(modifiedSVG.value);
      context?.drawImage(svgCanvas, 0, 0);
    }

    if (modifiedImage.value === null && modifiedSVG.value === null) {
      // if there is no modification on the elements, just show the main source image
      showSourceImageOnCanvas();
    }
  }
};

const drawSVGOnCanvas = (
  svgElement: HTMLElement
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    // draw the svg element on canvas
    const svgString = new XMLSerializer().serializeToString(svgElement);

    // Create a data URL from the SVG string
    const svgDataURL = 'data:image/svg+xml;base64,' + btoa(svgString);
    const image = new Image();

    // When the image is loaded, draw it onto the canvas
    image.onload = function () {
      const canvasElement = document.createElement('canvas');

      // Set canvas dimensions
      canvasElement.width = image.width;
      canvasElement.height = image.height;

      const context = canvasElement.getContext('2d');
      if (context) {
        context.drawImage(image, 0, 0);

        resolve(canvasElement);
      } else {
        reject(new Error('Unable to get 2D context for canvas.'));
      }
    };

    image.onerror = function (error) {
      reject(new Error('Error loading SVG image: ' + error));
    };

    image.src = svgDataURL;
  });
};

const drawImageOnCanvas = (image: HTMLImageElement) => {
  const canvasElement = document.createElement('canvas');

  //set diminstions
  canvasElement.width = image.width;
  canvasElement.height = image.height;
  const context = canvasElement.getContext('2d');
  // limit canvas's dimensions
  image.width < 800
    ? (canvasElement.style.width = canvasElement.width.toString() + 'px')
    : (canvasElement.style.width = '800px');
  image.height < 800
    ? (canvasElement.style.height = canvasElement.height.toString() + 'px')
    : (canvasElement.style.height = '800px');

  context?.drawImage(image, 0, 0);

  return canvasElement;
};

// validation function for svg file picker
const onRejected = (rejectedEntries: RejectedFileEntry[]) => {
  rejectedEntries.forEach((entry) => {
    let message;
    switch (entry.failedPropValidation) {
      case 'max-file-size':
        message = `The file size exceeds the maximum allowed limit(${
          Constants.MAX_IMAGE_FILE_SIZE / 1048576
        } MB).`;
        $q.notify({
          type: 'negative',
          message,
        });
        break;
      case 'accept':
        message =
          'Invalid file type. Please upload files with valid extensions.';
        $q.notify({
          type: 'negative',
          message,
        });
        break;
      default:
        message = 'File upload failed for an unknown reason.';
        $q.notify({
          type: 'negative',
          message,
        });
    }
  });
};

watch(
  isCanvasLoading,
  (newIsCanvasLoading) => {
    if (!newIsCanvasLoading) {
      drawAllModifiedElementsOnMainCanvas();
    }
  },
  { deep: true }
);

onMounted(() => {
  if (mainCanvas.value) {
    showSourceImageOnCanvas();
  }
});
</script>
<style scoped>
.image-container {
  background-color: #ffffff;
  background-image: radial-gradient(
    #444df756 1.1500000000000001px,
    #eef4f98e 1.1500000000000001px
  );
  background-size: 23px 23px;
  box-shadow: inset 0px 0px 7px 5px #0000001f;
  border-radius: 8px;
  transition: 0.5s ease;
  overflow: hidden;
  min-height: 100px;
}
.remove-image {
  position: absolute;
  width: 1rem;
  z-index: 1;
}

.drop {
  transition: 0.5s ease;
  color: black;
}
.result-container {
  opacity: 0;
  transition: 0.5s ease;
}
.zoom-container {
  transition: 0.3s ease;
  min-width: 30vw;
}
</style>
