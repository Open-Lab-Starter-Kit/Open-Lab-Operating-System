<template>
  <div class="column q-gutter-y-xl">
    <div class="row items-center">
      <span class="text-size">Algorithm:</span>
      <q-select
        square
        outlined
        dense
        behavior="menu"
        :options="Object.values(Constants.DITHERING_ALGORITHMS)"
        v-model="ditheringAlgorithm"
        class="col"
        @update:model-value="(newVal) => emit('update:algorithm', newVal)"
      />
    </div>

    <div
      v-if="ditheringAlgorithm === Constants.DITHERING_ALGORITHMS.GRID"
      class="row items-center"
    >
      <span class="text-size">Grid settings:</span>
      <div class="row col q-gutter-x-lg">
        <div class="row col items-center q-gutter-x-lg">
          <span>Block Size:</span>
          <q-slider
            v-model="ditheringBlockSize"
            :min="
              props.config?.laser_cutter_settings?.gcode_generator
                .dithering_settings.grid_algorithm.block_size.min
            "
            :max="
              props.config?.laser_cutter_settings?.gcode_generator
                .dithering_settings.grid_algorithm.block_size.max
            "
            :step="0.1"
            snap
            label
            :label-value="ditheringBlockSize + ' px'"
            label-always
            color="primary"
            class="col"
            @update:model-value="(newVal) => emit('update:blockSize', newVal)"
          />
        </div>
        <div class="row col items-center q-gutter-x-lg">
          <span>Block Distance:</span>
          <q-slider
            v-model="ditheringBlockDistance"
            :min="
              props.config?.laser_cutter_settings?.gcode_generator
                .dithering_settings.grid_algorithm.block_distance.min
            "
            :max="
              props.config?.laser_cutter_settings?.gcode_generator
                .dithering_settings.grid_algorithm.block_distance.max
            "
            :step="0.1"
            snap
            label
            :label-value="ditheringBlockDistance + ' px'"
            label-always
            color="primary"
            class="col"
            @update:model-value="
              (newVal) => emit('update:blockDistance', newVal)
            "
          />
        </div>
      </div>
    </div>

    <div class="row content-start items-center">
      <span class="text-size">Resolution:</span>
      <q-input
        v-model.number="ditheringResolution"
        type="number"
        :min="
          props.config?.laser_cutter_settings?.gcode_generator
            .dithering_settings.resolution.min
        "
        :max="
          props.config?.laser_cutter_settings?.gcode_generator
            .dithering_settings.resolution.max
        "
        outlined
        dense
        class="col"
        suffix="DPI"
        :error-message="errorMessage()"
        :error="!isValidDitheringResolution"
        @update:model-value="handleChangeResolutionValue"
      />
    </div>
    <div class="row items-center">
      <span class="text-size">Gray Shift:</span>
      <q-slider
        v-model="ditheringGrayShift"
        :min="-255"
        :max="255"
        :step="1"
        snap
        label
        :label-value="ditheringGrayShift"
        label-always
        color="grey-7"
        track-color="grey-1"
        class="col"
        @update:model-value="(newVal) => emit('update:grayShift', newVal)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { Constants } from 'src/constants';
import { Config } from 'src/interfaces/configSettings.interface';
import { ref, watch } from 'vue';

const props = defineProps<{
  config: Config | null;
  algorithm: string;
  resolution: number;
  grayShift: number;
  blockSize: number;
  blockDistance: number;
  isValidResolution: boolean;
}>();

const emit = defineEmits([
  'update:algorithm',
  'update:resolution',
  'update:grayShift',
  'update:blockSize',
  'update:blockDistance',
  'update:isValidResolution',
]);

const ditheringAlgorithm = ref<string>(props.algorithm);
const ditheringResolution = ref<number>(props.resolution);
const ditheringGrayShift = ref<number>(props.grayShift);
const ditheringBlockSize = ref<number>(props.blockSize);
const ditheringBlockDistance = ref<number>(props.blockDistance);

const isValidDitheringResolution = ref<boolean>(props.isValidResolution);

const handleChangeResolutionValue = (newResolution: number | string | null) => {
  if (typeof newResolution === 'number') {
    emit('update:resolution', newResolution);
    isValidDitheringResolution.value = props.config?.laser_cutter_settings
      ? newResolution <=
          props.config.laser_cutter_settings.gcode_generator.dithering_settings
            .resolution.max &&
        newResolution >
          props.config.laser_cutter_settings.gcode_generator.dithering_settings
            .resolution.min
      : false;
  } else {
    isValidDitheringResolution.value = false;
  }
};

const errorMessage = () => {
  if (props.config?.laser_cutter_settings) {
    const minValue =
      props.config.laser_cutter_settings.gcode_generator.dithering_settings
        .resolution.min;
    const maxValue =
      props.config.laser_cutter_settings.gcode_generator.dithering_settings
        .resolution.max;
    return `The value should be between ${minValue} and ${maxValue}`;
  }
};

// emit the validation changes to the parent component
watch(isValidDitheringResolution, (newIsValidDitheringResolution) => {
  emit('update:isValidResolution', newIsValidDitheringResolution);
});
</script>
src/interfaces/configSettings.interface
