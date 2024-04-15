<template>
  <div
    class="column col-7 col-md-7 col-sm-12 col-xs-12 q-gutter-sm items-center q-py-md"
  >
    <div class="row col q-px-md q-gutter-x-md">
      <q-btn
        icon="arrow_drop_down"
        round
        color="white"
        text-color="blue-grey-10"
        class="button-size rotate-135"
        @click="XYJog135"
        :disable="isDisabled"
      />
      <q-btn
        icon="arrow_drop_up"
        label="Y"
        color="white"
        stack
        text-color="blue-grey-10"
        class="button-size"
        push
        @click="XYJog90"
        :disable="isDisabled"
      />
      <q-btn
        icon="arrow_drop_up"
        round
        color="white"
        text-color="blue-grey-10"
        class="button-size rotate-45"
        @click="XYJog45"
        :disable="isDisabled"
      />
    </div>
    <div class="row col q-px-md q-gutter-x-md items-center">
      <q-btn
        label="X"
        icon="arrow_left"
        class="button-size"
        color="white"
        text-color="blue-grey-10"
        push
        @click="XYJog180"
        :disable="isDisabled"
      />
      <q-btn class="button-size" disable flat />
      <q-btn
        label="X"
        class="button-size"
        icon-right="arrow_right"
        color="white"
        text-color="blue-grey-10"
        push
        @click="XYJog0"
        :disable="isDisabled"
      />
    </div>
    <div class="row col q-px-md q-gutter-x-md items-end">
      <q-btn
        icon="arrow_drop_down"
        round
        class="button-size rotate-45"
        color="white"
        text-color="blue-grey-10"
        @click="XYJog225"
        :disable="isDisabled"
      />
      <q-btn
        stack
        class="button-size"
        color="white"
        text-color="blue-grey-10"
        push
        @click="XYJog270"
        :disable="isDisabled"
      >
        <span>Y</span>
        <q-icon name="arrow_drop_down" />
      </q-btn>
      <q-btn
        icon="arrow_drop_up"
        round
        class="button-size rotate-135"
        color="white"
        text-color="blue-grey-10"
        @click="XYJog315"
        :disable="isDisabled"
      />
    </div>
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
const { xJogStep, yJogStep, xyJogSpeed } = storeToRefs(store);
const XYJog0 = () => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands(
    'G1 X' + xJogStep.value + ' F' + xyJogSpeed.value * 60
  );
  executeNormalGCommands(Constants.COMMAND_ABSOLUTE_POSITION);
};

const XYJog45 = () => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands(
    'G1' +
      ' X' +
      xJogStep.value +
      ' Y' +
      yJogStep.value +
      ' F' +
      xyJogSpeed.value * 60
  );

  executeNormalGCommands(Constants.COMMAND_ABSOLUTE_POSITION);
};
const XYJog90 = () => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands(
    'G1 Y' + yJogStep.value + ' F' + xyJogSpeed.value * 60
  );
  executeNormalGCommands(Constants.COMMAND_ABSOLUTE_POSITION);
};
const XYJog135 = () => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands(
    'G1' +
      ' X-' +
      xJogStep.value +
      ' Y' +
      yJogStep.value +
      ' F' +
      xyJogSpeed.value * 60
  );

  executeNormalGCommands(Constants.COMMAND_ABSOLUTE_POSITION);
};
const XYJog180 = () => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands(
    'G1 X-' + xJogStep.value + ' F' + xyJogSpeed.value * 60
  );
  executeNormalGCommands(Constants.COMMAND_ABSOLUTE_POSITION);
};
const XYJog225 = () => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands(
    'G1' +
      ' X-' +
      xJogStep.value +
      ' Y-' +
      yJogStep.value +
      ' F' +
      xyJogSpeed.value * 60
  );

  executeNormalGCommands(Constants.COMMAND_ABSOLUTE_POSITION);
};
const XYJog270 = () => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands(
    'G1 Y-' + yJogStep.value + ' F' + xyJogSpeed.value * 60
  );
  executeNormalGCommands(Constants.COMMAND_ABSOLUTE_POSITION);
};
const XYJog315 = () => {
  executeNormalGCommands(Constants.COMMAND_RELATIVE_POSITION);
  executeNormalGCommands(
    'G1' +
      ' X' +
      xJogStep.value +
      ' Y-' +
      yJogStep.value +
      ' F' +
      xyJogSpeed.value * 60
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
