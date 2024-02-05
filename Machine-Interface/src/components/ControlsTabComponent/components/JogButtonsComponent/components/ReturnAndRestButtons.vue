<template>
  <div
    class="column col-5 col-md-5 col-sm-5 col-xs-5 items-center justify-start"
  >
    <div class="column q-gutter-y-sm">
      <span style="font-size: 1rem">Reset Zero</span>
      <div class="row q-gutter-sm">
        <q-btn
          label="X0"
          color="white"
          stack
          text-color="blue-grey-10"
          class="button-size"
          push
          @click="resetXToZero"
          :disable="isDisabled"
        />
        <q-btn
          label="Y0"
          color="white"
          stack
          text-color="blue-grey-10"
          class="button-size"
          push
          @click="resetYToZero"
          :disable="isDisabled"
        />
      </div>
      <div class="row q-gutter-x-sm">
        <q-btn
          label="XY0"
          color="white"
          stack
          text-color="blue-grey-10"
          class="button-size"
          push
          @click="resetXYToZero"
          :disable="isDisabled"
        />
        <q-btn
          label="Z0"
          color="white"
          stack
          text-color="blue-grey-10"
          class="button-size"
          push
          @click="resetZToZero"
          :disable="isDisabled"
        />
      </div>
    </div>
    <div class="col q-py-sm">
      <q-btn
        label="Return to zero"
        color="white"
        stack
        text-color="blue-grey-10"
        class="large-button-size"
        push
        @click="returnToZero"
        :disable="isDisabled"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { Constants } from 'src/constants';
import { executeNormalGCommands } from 'src/services/controls.service';
import { useMachineStatusStore } from 'src/stores/machine-status';

defineProps<{
  isDisabled: boolean;
}>();

const store = useMachineStatusStore();

const resetXToZero = () => {
  executeNormalGCommands(Constants.COMMAND_RESET_ZERO_X);
  store.resetXJobPosition();
};

const resetYToZero = () => {
  executeNormalGCommands(Constants.COMMAND_RESET_ZERO_Y);
  store.resetYJobPosition();
};

const resetXYToZero = () => {
  executeNormalGCommands(Constants.COMMAND_RESET_ZERO_XY);
  store.resetXYJobPosition();
};

const resetZToZero = () => {
  executeNormalGCommands(Constants.COMMAND_RESET_ZERO_Z);
  store.resetZJobPosition();
};

const returnToZero = () => {
  executeNormalGCommands(Constants.COMMAND_RETURN_ZERO);
};
</script>

<style scoped>
.large-button-size {
  font-size: 15px;
  width: 150px;
  height: 60px;
}
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
