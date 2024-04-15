<template>
  <q-btn
    icon="restart_alt"
    label="Soft Reset"
    stack
    color="grey-4"
    text-color="black"
    class="col items-center q-py-md"
    style="font-size: 0.85rem"
    @click="softResetMachine()"
    :disable="isSoftResetBtnDisabled()"
  />
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { executeNormalGCommands } from 'src/services/execute.commands.service';
import { useMachineStatusStore } from 'src/stores/machine-status';

const store = useMachineStatusStore();
const { status, machineState } = storeToRefs(store);

const isSoftResetBtnDisabled = () => {
  if (machineState.value === Constants.RUN) return true;
  return false;
};

const softResetMachine = () => {
  status.value.state = Constants.CONNECTED;
  executeNormalGCommands(Constants.GRBL_COMMAND_SOFT_RESET);
};
</script>
src/services/execute.commands.service
