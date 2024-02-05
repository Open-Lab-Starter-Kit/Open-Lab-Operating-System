<template>
  <q-btn
    icon="lock_open"
    label="Unlock"
    stack
    color="grey-4"
    text-color="black"
    class="col items-center q-py-md"
    style="font-size: 0.85rem"
    @click="unlockMachine()"
    :disable="isUnlockBtnDisabled()"
  />
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { executeNormalGCommands } from 'src/services/controls.service';
import { useMachineStatusStore } from 'src/stores/machine-status';

const store = useMachineStatusStore();
const { machineState } = storeToRefs(store);
const isUnlockBtnDisabled = () => {
  if (machineState.value !== Constants.ALARM) return true;
  return false;
};

const unlockMachine = () => {
  executeNormalGCommands(Constants.GRBL_COMMAND_UNLOCK);
};
</script>
