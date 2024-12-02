<template>
  <div class="row items-center q-gutter-x-md">
    <span>X</span>

    <q-slider
      class="slider-width"
      v-model="xSliderValue"
      @change="store.setXJogStepSlider"
      markers
      :min="0"
      :max="3"
      thumb-size="25px"
      :disable="isSliderDisabled()"
    />
    <div
      class="row col-md col-sm-12 col-xs-12 items-center justify-end q-gutter-x-sm q-pr-md"
    >
      <span class="text-h8 text-bold">{{ xJogStep }} mm</span>
      <q-btn
        :icon="isCustomXStepValue ? 'close' : 'edit'"
        round
        outline
        class="custom-btn"
        @click="
          isCustomXStepValue ? clearXStepCustomValue() : openXCustomStepDialog()
        "
        :disable="isDisabled"
      />
    </div>
  </div>
  <!-- Dialog Component -->
  <custom-dialog
    v-model="dialogVisible"
    :jog-value="xJogStep"
    jog-axis="X"
    @dialogSet="setXStepCustomValue"
    @dialogClear="clearXStepCustomValue"
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
const { xJogStep, xSliderValue, isCustomXStepValue } = storeToRefs(store);

const dialogVisible = ref(false);

const isSliderDisabled = () => {
  if (props.isDisabled || isCustomXStepValue.value) return true;
  return false;
};

const openXCustomStepDialog = () => {
  dialogVisible.value = true;
};

const setXStepCustomValue = (newValue: number) => {
  xJogStep.value = newValue;
  isCustomXStepValue.value = true;
};

const clearXStepCustomValue = () => {
  // reset to its init value
  xJogStep.value = 0.1;
  xSliderValue.value = 0;
  // Re-enable the slide
  isCustomXStepValue.value = false;
};
</script>
