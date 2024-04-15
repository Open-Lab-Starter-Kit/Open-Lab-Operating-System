<template>
  <div class="column q-my-sm flex-center full-width">
    <div class="row full-width justify-between">
      <div class="column col-xs-12 col-sm-6 col-md-4 items-center">
        <span class="text-size">X</span>
        <div
          :class="[
            { 'cursor-pointer': machineState === Constants.IDLE },
            'rounded-borders',
            'q-pa-sm',
          ]"
          style="font-size: x-large; border: dotted 1px"
        >
          {{ previewState.clampedX }}

          <q-popup-edit
            v-model="previewState.clampedX"
            buttons
            label-set="Save"
            label-cancel="Close"
            v-slot="scope"
            :validate="XAxisRangeValidation"
            :disable="machineState !== Constants.IDLE"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              hint="Enter a number between 0 and 1000"
              :error="errorXAxis"
              :error-message="errorXAxisMessage"
              dense
              autofocus
              @keyup.enter="scope.set"
              @keydown="sanitizeInput"
              class="position-metric"
              input-style="font-size: 40px"
            />
          </q-popup-edit>
        </div>
      </div>
      <div class="column col-xs-12 col-sm-6 col-md-4 items-center">
        <span class="text-size">Y</span>
        <div
          :class="[
            { 'cursor-pointer': machineState === Constants.IDLE },
            'rounded-borders',
            'q-pa-sm',
          ]"
          style="font-size: x-large; border: dotted 1px"
        >
          {{ previewState.clampedY }}

          <q-popup-edit
            v-model="previewState.clampedY"
            buttons
            label-set="Save"
            label-cancel="Close"
            v-slot="scope"
            :validate="YAxisRangeValidation"
            :disable="machineState !== Constants.IDLE"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              hint="Enter a number between 0 and 600"
              :error="errorYAxis"
              :error-message="errorYAxisMessage"
              dense
              autofocus
              @keyup.enter="scope.set"
              @keydown="sanitizeInput"
              class="position-metric"
              input-style="font-size: 40px"
            />
          </q-popup-edit>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useMachineStatusStore } from 'src/stores/machine-status';
import { Constants } from 'src/constants';
import { useGcodePreview } from 'src/stores/gcode-preview';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

const gcodePreviewStore = useGcodePreview();
const { previewState } = storeToRefs(gcodePreviewStore);

const machineStatusStore = useMachineStatusStore();
const { machineState } = storeToRefs(machineStatusStore);

// validation
const errorXAxis = ref(false);
const errorYAxis = ref(false);
const errorXAxisMessage = ref('');
const errorYAxisMessage = ref('');

const XAxisRangeValidation = (val: string) => {
  if (parseFloat(val) < 0 || parseFloat(val) > 1000 || val === '') {
    errorXAxis.value = true;
    errorXAxisMessage.value = 'The value must be between 0 and 1000!';
    return false;
  }
  errorXAxis.value = false;
  errorXAxisMessage.value = '';
  return true;
};

const YAxisRangeValidation = (val: string) => {
  if (parseFloat(val) < 0 || parseFloat(val) > 600 || val === '') {
    errorYAxis.value = true;
    errorYAxisMessage.value = 'The value must be between 0 and 600!';
    return false;
  }
  errorYAxis.value = false;
  errorYAxisMessage.value = '';
  return true;
};

const sanitizeInput = (event: KeyboardEvent) => {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
  // Regular expression to match numbers with up to 4 real numbers and 1 decimal
  const regex = /^\d{0,4}(\.\d{0,1})?$/;
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
