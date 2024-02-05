<template>
  <q-btn
    icon="home"
    label="Homing"
    stack
    color="grey-4"
    text-color="black"
    class="col q-mb-md q-pa-lg"
    style="font-size: 1rem"
    @click="homingMachine()"
    :disable="isHomeBtnDisabled()"
  />
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { executeNormalGCommands } from 'src/services/controls.service';
import { useMachineStatusStore } from 'src/stores/machine-status';

const store = useMachineStatusStore();
const { machineState } = storeToRefs(store);

const isHomeBtnDisabled = () => {
  if (
    machineState.value !== Constants.IDLE &&
    machineState.value !== Constants.ALARM
  )
    return true;
  return false;
};

const homingMachine = () => {
  executeNormalGCommands(Constants.GRBL_COMMAND_HOMING);
};
</script>
