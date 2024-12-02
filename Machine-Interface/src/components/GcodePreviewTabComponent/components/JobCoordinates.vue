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
          {{ xJobStartingValue.toFixed(2) }}

          <q-popup-edit
            v-model="xJobStartingValue"
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
          {{ yJobStartingValue.toFixed(2) }}

          <q-popup-edit
            v-model="yJobStartingValue"
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
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import {
  xJobStartingValue,
  yJobStartingValue,
} from 'src/services/draw.gcode.service/draw.gcode.2D.service';
import { Config } from 'src/interfaces/configSettings.interface';

const machineStatusStore = useMachineStatusStore();
const { machineState } = storeToRefs(machineStatusStore);
const props = defineProps<{
  config: Config | null;
}>();

// validation
const errorXAxis = ref(false);
const errorYAxis = ref(false);
const errorXAxisMessage = ref('');
const errorYAxisMessage = ref('');

const XAxisRangeValidation = (val: string) => {
  if (
    props.config &&
    (parseFloat(val) < props.config?.machine_platform.start_point.x ||
      parseFloat(val) > props.config?.machine_platform.end_point.x ||
      val === '')
  ) {
    errorXAxis.value = true;
    errorXAxisMessage.value = `The value must be between ${props.config?.machine_platform.start_point.x} and ${props.config?.machine_platform.end_point.x}!`;
    return false;
  }
  errorXAxis.value = false;
  errorXAxisMessage.value = '';
  return true;
};

const YAxisRangeValidation = (val: string) => {
  if (
    props.config &&
    (parseFloat(val) > props.config?.machine_platform.start_point.y ||
      parseFloat(val) < props.config?.machine_platform.end_point.y ||
      val === '')
  ) {
    errorYAxis.value = true;
    errorYAxisMessage.value = `The value must be between ${props.config?.machine_platform.start_point.y} and ${props.config?.machine_platform.end_point.y}!`;
    return false;
  }
  errorYAxis.value = false;
  errorYAxisMessage.value = '';
  return true;
};

const sanitizeInput = (event: KeyboardEvent) => {
  if (['e', 'E', '+'].includes(event.key)) {
    event.preventDefault();
  }
  // Regular expression to match numbers with up to 4 real numbers and 1 decimal
  const regex = /^-?\d{0,3}(\.\d{0,1})?$/;
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
