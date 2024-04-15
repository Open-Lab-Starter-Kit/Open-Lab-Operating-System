<template>
  <div class="row items-center q-gutter-x-md">
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
    <div class="row col-md col-sm-12 col-xs-12 flex-center q-gutter-x-sm">
      <span class="text-h8 text-bold">{{ yJogStep }} mm</span>
      <q-btn
        :icon="
          isCustomYStepValue || (isCustomXStepValue && isXYLocked)
            ? 'close'
            : 'edit'
        "
        round
        outline
        class="custom-btn"
        @click="
          isCustomYStepValue ? clearYStepCustomValue() : openYCustomStepDialog()
        "
        :disable="isDisabled || isXYLocked"
      />
    </div>
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

const {
  yJogStep,
  ySliderValue,
  isCustomXStepValue,
  isCustomYStepValue,
  isXYLocked,
} = storeToRefs(store);
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
  yJogStep.value = 0.1;
  ySliderValue.value = 0;
  // Reenable the slider
  isCustomYStepValue.value = false;
};
</script>
