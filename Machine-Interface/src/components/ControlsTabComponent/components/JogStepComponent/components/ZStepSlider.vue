<template>
  <div class="row col-4 items-center q-gutter-x-md">
    <span>Z</span>

    <q-slider
      class="slider-width"
      v-model="zSliderValue"
      @change="store.setZJogStepSlider"
      markers
      :min="0"
      :max="3"
      thumb-size="25px"
      :disable="isSliderDisabled()"
    />
    <div class="row col-md col-sm-12 col-xs-12 flex-center q-gutter-x-sm">
      <span class="text-h8 text-bold">{{ zJogStep }} mm</span>
      <q-btn
        :icon="isCustomZStepValue ? 'close' : 'edit'"
        round
        outline
        class="custom-btn"
        @click="
          isCustomZStepValue ? clearZStepCustomValue() : openZCustomStepDialog()
        "
        :disable="isDisabled"
      />
    </div>
  </div>
  <!-- Dialog Component -->
  <custom-dialog
    v-model="dialogVisible"
    :jog-value="zJogStep"
    jog-axis="Z"
    @dialogSet="setZStepCustomValue"
    @dialogClear="clearZStepCustomValue"
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

const { zJogStep, zSliderValue, isCustomZStepValue } = storeToRefs(store);

const dialogVisible = ref(false);

const isSliderDisabled = () => {
  if (props.isDisabled || isCustomZStepValue.value) return true;
  return false;
};

const openZCustomStepDialog = () => {
  dialogVisible.value = true;
};

const setZStepCustomValue = (newValue: number) => {
  zJogStep.value = newValue;
  isCustomZStepValue.value = true;
};

const clearZStepCustomValue = () => {
  // reset to its init value
  zJogStep.value = 0.1;
  zSliderValue.value = 0;
  // Re-enable the slider
  isCustomZStepValue.value = false;
};
</script>
