<template>
  <div
    class="column col-2 col-md-2 col-sm-5 col-xs-5 q-gutter-y-xl flex-center q-py-md"
  >
    <q-btn
      label="Z"
      icon="arrow_drop_up"
      stack
      color="white"
      text-color="blue-grey-10"
      class="button-size"
      @click="ZJogUp"
      :disable="isDisabled"
    />
    <q-btn
      stack
      color="white"
      text-color="blue-grey-10"
      class="button-size"
      @click="ZJogDown"
      :disable="isDisabled"
    >
      <span>Z</span>
      <q-icon name="arrow_drop_down" />
    </q-btn>
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { executeNormalGCommands } from 'src/services/execute.commands.service';
import { useJogControlsStore } from 'src/stores/jog-controls';

defineProps<{
  isDisabled: boolean;
}>();

const store = useJogControlsStore();
const { zJogStep, zJogSpeed } = storeToRefs(store);

const ZJogUp = () => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands('G1 Z' + zJogStep.value + ' F' + zJogSpeed.value * 60);
  executeNormalGCommands(Constants.COMMAND_ABSOLUTE_POSITION);
};

const ZJogDown = () => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands(
    'G1 Z-' + zJogStep.value + ' F' + zJogSpeed.value * 60
  );
  executeNormalGCommands(Constants.COMMAND_ABSOLUTE_POSITION);
};
</script>
<style scoped>
.button-size {
  font-size: 20px;
  width: 70px;
  height: 70px;

  i {
    padding: 0;
    margin: -5;
  }
}
</style>
src/services/execute.commands.service
