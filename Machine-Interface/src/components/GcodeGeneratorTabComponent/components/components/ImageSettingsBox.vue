<template>
  <q-card flat bordered>
    <q-expansion-item
      v-model="expandMetrics"
      dense-toggle
      header-style="fontSize: 18px"
    >
      <template v-slot:header>
        <q-item-section> Image Settings </q-item-section>
      </template>
      <template v-slot:default>
        <div class="row fit q-pa-md items-start justify-between">
          <div class="column col-md col-sm-12 col-xs-12 fit q-gutter-y-md">
            <div class="row items-center q-gutter-x-md">
              <span class="text-bold">Original Width:</span>
              <div class="q-pa-sm">{{ imageOriginalWidth }} mm</div>
            </div>
            <div class="row items-center q-gutter-x-md">
              <span class="text-bold">Original Height:</span>
              <div class="q-pa-sm">{{ imageOriginalHeight }} mm</div>
            </div>
          </div>
          <div
            class="row fit items-center col-md col-sm-12 col-xs-12 q-pb-md q-gutter-x-md"
          >
            <div class="column">
              <span class="text-bold flip-vertical self-center">L</span>
              <q-btn
                :icon="isScaleLocked ? 'lock_open' : 'lock'"
                text-color="black"
                class="bg-white q-pa-xs"
                color="bg-white"
                outline
                push
                size="sm"
                @click="changeScaleValues"
              >
                <q-tooltip class="bg-black">{{
                  isScaleLocked ? 'Unlock Scale' : 'Lock Scale'
                }}</q-tooltip>
              </q-btn>
              <span class="text-bold self-center">L</span>
            </div>
            <div class="column q-gutter-y-md">
              <div class="row items-center q-gutter-x-md">
                <span class="text-bold">Scaled Width:</span>
                <div class="rounded-borders q-pa-sm cursor-pointer edit-box">
                  {{ parseFloat(imageScaledWidth) }} mm
                  <q-popup-edit
                    v-model="imageScaledWidth"
                    buttons
                    label-set="Save"
                    label-cancel="Close"
                    v-slot="scope"
                    :validate="isScaledWidthValid"
                    @save="saveScaledWidth"
                  >
                    <q-input
                      v-model="scope.value"
                      dense
                      autofocus
                      suffix="mm"
                      :error="errorScaledWidth"
                      :error-message="errorScaledWidthMessage"
                      @keyup.enter="scope.set"
                      @keydown="sanitizeInput"
                      class="position-metric"
                    />
                  </q-popup-edit>
                </div>
              </div>
              <div class="row items-center q-gutter-x-md">
                <span class="text-bold">Scaled Height:</span>
                <div class="rounded-borders q-pa-sm cursor-pointer edit-box">
                  {{
                    parseFloat(imageScaledHeight) > 0
                      ? parseFloat(imageScaledHeight)
                      : -parseFloat(imageScaledHeight)
                  }}
                  mm
                  <q-popup-edit
                    v-model="imageScaledHeight"
                    buttons
                    label-set="Save"
                    label-cancel="Close"
                    v-slot="scope"
                    :validate="isScaledHeightValid"
                    @save="saveScaledHeight"
                  >
                    <q-input
                      v-model="scope.value"
                      dense
                      autofocus
                      suffix="mm"
                      :error="errorScaledHeight"
                      :error-message="errorScaledHeightMessage"
                      @keyup.enter="scope.set"
                      @keydown="sanitizeInput"
                      class="position-metric"
                    />
                  </q-popup-edit>
                </div>
              </div>
            </div>
          </div>
          <div class="column col-md col-sm-12 col-xs-12 fit q-gutter-y-md">
            <div class="row items-center q-gutter-x-md">
              <span class="text-bold">Rotation:</span>
              <div class="rounded-borders q-pa-sm cursor-pointer edit-box">
                {{ imageRotation }}°
                <q-popup-edit
                  v-model="imageRotation"
                  buttons
                  label-set="Save"
                  label-cancel="Close"
                  v-slot="scope"
                  :validate="isRotationError"
                  @save="saveRotation"
                >
                  <q-input
                    v-model="scope.value"
                    dense
                    autofocus
                    suffix="°"
                    :error="errorRotation"
                    :error-message="errorRotationMessage"
                    @keyup.enter="scope.set"
                    @keydown="sanitizeInput"
                    class="position-metric"
                  />
                </q-popup-edit>
              </div>
              <q-btn
                outline
                icon="rotate_90_degrees_ccw"
                class="q-pa-sm"
                :disable="!is90RotationValid"
                :color="!is90RotationValid ? 'grey-4' : 'black'"
                @click="rotate90Degree(false)"
              >
                <q-tooltip class="bg-black">Rotate -90°</q-tooltip>
              </q-btn>
              <q-btn
                outline
                class="q-pa-sm"
                :disable="!is90RotationValid"
                :color="!is90RotationValid ? 'grey-4' : 'black'"
                @click="rotate90Degree()"
              >
                <q-icon name="rotate_90_degrees_ccw" class="flip-horizontal" />
                <q-tooltip class="bg-black">Rotate +90°</q-tooltip>
              </q-btn>
            </div>
            <div class="row items-center q-gutter-x-md">
              <span class="text-bold">Flip:</span>
              <div class="row items-center q-gutter-x-sm">
                <q-btn outline class="q-pa-sm" @click="flipVertically">
                  <q-icon name="flip" class="rotate-90" />
                </q-btn>
                <q-btn
                  outline
                  class="q-pa-sm"
                  icon="flip"
                  @click="flipHorizontally"
                />
              </div>
            </div>
          </div>
        </div>
        <q-btn
          class="float-right"
          size="lg"
          label="Reset All"
          outline
          @click="restoreDefaultMetrics"
        />
      </template>
    </q-expansion-item>
  </q-card>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { ImageMetrics } from 'src/interfaces/imageToGcode.interface';
import { Config } from 'src/interfaces/configSettings.interface';
import { getPlatformDimensions } from 'src/services/draw.gcode.service/draw.gcode.helper.service';
import { Constants } from 'src/constants';
import Konva from 'konva';

const props = defineProps<{
  imageMetrics: ImageMetrics;
  config: Config | null;
  stageConfig: Konva.StageConfig;
  updateMetrics: (metrics: ImageMetrics) => void;
  restoreDefaultMetrics: () => void;
  changeEnabledTransformationAnchors: (isLocked: boolean) => void;
}>();

const expandMetrics = ref<boolean>(true);
const isScaleLocked = ref<boolean>(false);
const is90RotationValid = ref<boolean>(false);

const imageOriginalWidth = ref<string>(props.imageMetrics.width.toFixed(2));
const imageOriginalHeight = ref<string>(props.imageMetrics.height.toFixed(2));
const imageScaledWidth = ref<string>(
  (props.imageMetrics.width * props.imageMetrics.scaleX).toFixed(2)
);
const imageScaledHeight = ref<string>(
  (props.imageMetrics.height * props.imageMetrics.scaleY).toFixed(2)
);

const imageRotation = ref<string>(props.imageMetrics.rotation.toFixed(2));

const saveScaledWidth = (value: string) => {
  imageScaledWidth.value = value;
  if (isScaleLocked.value) {
    matchImageWidthScale();
  }
  setImageMetrics();
};

const saveScaledHeight = (value: string) => {
  imageScaledHeight.value = value;
  if (isScaleLocked.value) {
    matchImageHeightScale();
  }
  setImageMetrics();
};

const saveRotation = (value: string) => {
  imageRotation.value = value;
  setImageMetrics();
};

const flipVertically = () => {
  imageScaledHeight.value = (
    -1 * parseFloat(imageScaledHeight.value)
  ).toString();
  setImageMetrics();
};

const flipHorizontally = () => {
  imageScaledHeight.value = (
    -1 * parseFloat(imageScaledHeight.value)
  ).toString();

  if (parseFloat(imageRotation.value) < 180) {
    imageRotation.value = (180 + parseFloat(imageRotation.value)).toFixed(2);
  } else {
    imageRotation.value = (parseFloat(imageRotation.value) - 180).toFixed(2);
  }
  setImageMetrics();
};

const rotate90Degree = (isClockWise = true) => {
  if (isClockWise) {
    imageRotation.value = (parseFloat(imageRotation.value) + 90).toString();
  } else {
    imageRotation.value = (parseFloat(imageRotation.value) - 90).toString();
  }
  if (parseFloat(imageRotation.value) < 0) {
    imageRotation.value = (parseFloat(imageRotation.value) + 360).toString();
  }

  if (parseFloat(imageRotation.value) >= 360) {
    imageRotation.value = (parseFloat(imageRotation.value) - 360).toString();
  }
  setImageMetrics();
};

// error messages for inputs values
const errorScaledWidth = ref<boolean>(false);
const errorScaledHeight = ref<boolean>(false);
const errorRotation = ref<boolean>(false);

const errorScaledWidthMessage = ref<string>('');
const errorScaledHeightMessage = ref<string>('');
const errorRotationMessage = ref<string>('');

const isScaledWidthValid = (val: string) => {
  let platformWidth =
    props.stageConfig.width ??
    Constants.FALLBACK_GCODE_GENERATOR_STAGE_METRICS.width;
  if (props.config) {
    platformWidth = getPlatformDimensions(props.config).platformWidth;
  }
  if (0 <= parseFloat(val) && parseFloat(val) <= platformWidth) {
    errorScaledWidth.value = false;
    return true;
  } else {
    errorScaledWidth.value = true;
    errorScaledWidthMessage.value = `Please Enter a value between 0 and ${platformWidth.toFixed(
      2
    )}`;
    return false;
  }
};

const isScaledHeightValid = (val: string) => {
  let platformHeight =
    props.stageConfig.height ??
    Constants.FALLBACK_GCODE_GENERATOR_STAGE_METRICS.height;
  if (props.config) {
    platformHeight = getPlatformDimensions(props.config).platformHeight;
  }
  if (0 <= parseFloat(val) && parseFloat(val) <= platformHeight) {
    errorScaledHeight.value = false;
    return true;
  } else {
    errorScaledHeight.value = true;
    errorScaledHeightMessage.value = `Please Enter a value between 0 and ${platformHeight.toFixed(
      2
    )}`;
    return false;
  }
};

const isRotationValid = (val: string) => {
  if (props.config && props.stageConfig.width && props.stageConfig.height) {
    const platformWidth = getPlatformDimensions(props.config).platformWidth;
    const platformHeight = getPlatformDimensions(props.config).platformHeight;

    // Convert to radians
    const rotationInRadians = (parseFloat(val) * Math.PI) / 180;

    // Calculate rotated bounding box dimensions
    const rotatedWidth =
      Math.abs(
        parseFloat(imageScaledWidth.value) * Math.cos(rotationInRadians)
      ) +
      Math.abs(
        parseFloat(imageScaledHeight.value) * Math.sin(rotationInRadians)
      );
    const rotatedHeight =
      Math.abs(
        parseFloat(imageScaledWidth.value) * Math.sin(rotationInRadians)
      ) +
      Math.abs(
        parseFloat(imageScaledHeight.value) * Math.cos(rotationInRadians)
      );

    // Validate against the stageConfig width and height
    if (rotatedWidth < platformWidth && rotatedHeight < platformHeight) {
      return true;
    }
    return false;
  }
  return false;
};

const isRotationError = (val: string) => {
  if (isRotationValid(val)) {
    // rotation value bigger than 360 or lower that 0
    if (0 > parseFloat(val) || parseFloat(val) > 360) {
      errorRotation.value = true;
      errorRotationMessage.value = 'Please enter a value between 0 and 360';
      return false;
    } else {
      errorRotation.value = false;
      return true;
    }
  } else {
    errorRotation.value = true;
    errorRotationMessage.value =
      'The rotation will cause the image to exceed the viewer dimensions.';
  }
  return false;
};

const changeScaleValues = () => {
  setImageMetrics();
  isScaleLocked.value = !isScaleLocked.value;
  props.changeEnabledTransformationAnchors(isScaleLocked.value);
};

const matchImageWidthScale = () => {
  const scale =
    parseFloat(imageScaledWidth.value) /
    (props.imageMetrics.width * props.imageMetrics.scaleX);

  let scaledHeight = parseFloat(imageScaledHeight.value) * scale;

  if (parseFloat(imageScaledHeight.value) < 0) {
    scaledHeight *= -1;
  }

  // Check against platform constraints
  let platformHeight =
    props.stageConfig.height ??
    Constants.FALLBACK_GCODE_GENERATOR_STAGE_METRICS.height;
  if (props.config) {
    platformHeight = getPlatformDimensions(props.config).platformHeight;
  }

  imageScaledHeight.value = Math.min(scaledHeight, platformHeight).toFixed(2);
};

const matchImageHeightScale = () => {
  const scale =
    parseFloat(imageScaledHeight.value) /
    (props.imageMetrics.height * props.imageMetrics.scaleY);
  let scaledWidth = parseFloat(imageScaledWidth.value) * scale;

  let platformWidth =
    props.stageConfig.width ??
    Constants.FALLBACK_GCODE_GENERATOR_STAGE_METRICS.width;
  if (props.config) {
    platformWidth = getPlatformDimensions(props.config).platformWidth;
  }

  imageScaledWidth.value = Math.min(scaledWidth, platformWidth).toFixed(2);
};

const setImageMetrics = () => {
  if (props.config && props.stageConfig) {
    const { platformWidth, platformHeight } = getPlatformDimensions(
      props.config
    );

    const stageWidth =
      props.stageConfig.width ??
      Constants.FALLBACK_GCODE_GENERATOR_STAGE_METRICS.width;
    const stageHeight =
      props.stageConfig.height ??
      Constants.FALLBACK_GCODE_GENERATOR_STAGE_METRICS.height;
    const metrics: ImageMetrics = {
      ...props.imageMetrics,
      scaleX:
        (parseFloat(imageScaledWidth.value) / props.imageMetrics.width) *
        (stageWidth / platformWidth),
      scaleY:
        (parseFloat(imageScaledHeight.value) / props.imageMetrics.height) *
        (stageHeight / platformHeight),
      rotation: parseFloat(imageRotation.value),
    };
    props.updateMetrics(metrics);
  }
};

watch(props.imageMetrics, (newMetrics) => {
  imageOriginalWidth.value = newMetrics.width.toFixed(2);
  imageOriginalHeight.value = newMetrics.height.toFixed(2);
  imageScaledWidth.value = (
    props.imageMetrics.width * props.imageMetrics.scaleX
  ).toFixed(2);
  imageScaledHeight.value = (
    props.imageMetrics.height * props.imageMetrics.scaleY
  ).toFixed(2);
  imageRotation.value = props.imageMetrics.rotation.toFixed(2);

  // check if we can rotate the image 90 degrees for the buttons
  is90RotationValid.value = isRotationValid('90');
});

const sanitizeInput = (event: KeyboardEvent) => {
  if (['e', 'E', '+'].includes(event.key)) {
    event.preventDefault();
  }
  // Regular expression to match numbers with up to 4 real numbers and 1 decimal
  const regex = /^-?\d{0,3}(\.\d{0,2})?$/;
  const target = event.target as HTMLInputElement;
  const isValid = regex.test(target.value);

  if (
    !isValid &&
    event.key !== 'Backspace' &&
    event.key !== 'Delete' &&
    event.key !== 'ArrowLeft' &&
    event.key !== 'ArrowRight' &&
    event.key !== 'ArrowUp' &&
    event.key !== 'ArrowDown'
  )
    event.preventDefault();
};
</script>
<style scoped>
.edit-box {
  border: dotted 1px;
}
</style>
