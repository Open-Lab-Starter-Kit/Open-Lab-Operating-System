<template>
  <div class="row items-center justify-between">
    <span>Y</span>

    <q-slider
      class="slider-width"
      v-model="ySliderValue"
      @change="store.setYJogStepSlider"
      markers
      :min="0"
      :max="3"
      thumb-size="25px"
      :disable="isSliderDisabled() || isXYLocked"
    />
    <q-btn
      icon-right="edit"
      rounded
      outline
      class="custom-btn"
      :label="yJogStep"
      @click="openYCustomStepDialog"
      :disable="isDisabled || isXYLocked"
    />
  </div>
  <!-- Dialog Component -->
  <custom-dialog
    v-model="dialogVisible"
    :jog-value="yJogStep"
    jog-axis="Y"
    @dialogSet="setYStepCustomValue"
    @dialogClear="clearYStepCustomValue"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useJogControlsStore } from 'src/stores/jog-controls';
import CustomDialog from './CustomDialog.vue';
import { ref } from 'vue';

const props = defineProps<{
  isDisabled: boolean;
}>();

const store = useJogControlsStore();

const { yJogStep, ySliderValue, isCustomYStepValue, isXYLocked } =
  storeToRefs(store);
const dialogVisible = ref(false);

const isSliderDisabled = () => {
  if (props.isDisabled || isCustomYStepValue.value) return true;
  return false;
};

const openYCustomStepDialog = () => {
  dialogVisible.value = true;
};

const setYStepCustomValue = (newValue: number) => {
  yJogStep.value = newValue;
  // Disable the slider
  isCustomYStepValue.value = true;
};

const clearYStepCustomValue = () => {
  // reset to its init value
  yJogStep.value = 0.01;
  ySliderValue.value = 0;
  // Reenable the slider
  isCustomYStepValue.value = false;
};
</script>
