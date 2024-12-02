<template>
  <div class="column q-my-sm flex-center full-width">
    <span class="text-size">Job Position</span>
    <div class="row full-width justify-evenly">
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
          {{ jobPosition.x }}

          <q-popup-edit
            v-model="jobPosition.x"
            buttons
            label-set="SET"
            label-cancel="CANCEL"
            v-slot="scope"
            :disable="machineState !== Constants.IDLE"
            @save="handleXSetPosition"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              hint="Advance user only!"
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
          {{ jobPosition.y }}

          <q-popup-edit
            v-model="jobPosition.y"
            buttons
            label-set="SET"
            label-cancel="CANCEL"
            v-slot="scope"
            :disable="machineState !== Constants.IDLE"
            @save="handleYSetPosition"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              hint="Advance user only!"
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
      <div
        v-if="config?.machine_type !== Constants.MACHINE_TYPE.VINYL_CUTTER"
        class="column col-xs-12 col-sm-6 col-md-4 items-center"
      >
        <span class="text-size">Z</span>
        <div
          :class="[
            { 'cursor-pointer': machineState === Constants.IDLE },
            'rounded-borders',
            'q-pa-sm',
          ]"
          style="font-size: x-large; border: dotted 1px"
        >
          {{ jobPosition.z }}

          <q-popup-edit
            v-model="jobPosition.z"
            buttons
            label-set="SET"
            label-cancel="CANCEL"
            v-slot="scope"
            :disable="machineState !== Constants.IDLE"
            @save="handleZSetPosition"
          >
            <q-input
              type="number"
              v-model.number="scope.value"
              hint="Advance user only!"
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
import { QPopupEdit } from 'quasar';
import { Constants } from 'src/constants';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { executeNormalGCommands } from 'src/services/execute.commands.service';
import { storeToRefs } from 'pinia';
import { Config } from 'src/interfaces/configSettings.interface';

defineProps<{
  config: Config | null;
}>();

const machineStatusStore = useMachineStatusStore();
const { machineState, jobPosition } = storeToRefs(machineStatusStore);

const handleXSetPosition = (value: string) => {
  if (value !== '') {
    executeNormalGCommands('G92 X' + value);
    machineStatusStore.setXJobPosition(parseFloat(value));
  }
};
const handleYSetPosition = (value: string) => {
  if (value !== '') {
    executeNormalGCommands('G92 Y' + value);
    machineStatusStore.setYJobPosition(parseFloat(value));
  }
};
const handleZSetPosition = (value: string) => {
  if (value !== '') {
    executeNormalGCommands('G92 Z' + value);
    machineStatusStore.setZJobPosition(parseFloat(value));
  }
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
<style scoped>
.text-size {
  font-size: large;
  text-align: center;
}
.position-metric {
  font-size: x-large;
  font-weight: 500;
}
</style>
src/interfaces/configSettings.interface
