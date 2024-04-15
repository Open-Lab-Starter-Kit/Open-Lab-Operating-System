<template>
  <div class="column flex-center q-pa-sm q-gutter-y-lg">
    <span class="text-bold" style="font-size: 1rem">Reset Zero</span>
    <div class="row q-gutter-md">
      <div class="column self-center justify-around">
        <div class="row q-gutter-x-md q-pb-md">
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
        <q-btn
          label="XY0"
          color="white"
          stack
          text-color="blue-grey-10"
          size="xl"
          push
          @click="resetXYToZero"
          :disable="isDisabled"
        />
      </div>
      <q-btn
        label="Z0"
        color="white"
        stack
        size="xl"
        text-color="blue-grey-10"
        push
        @click="resetZToZero"
        :disable="isDisabled"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { Constants } from 'src/constants';
import { executeNormalGCommands } from 'src/services/execute.commands.service';
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
src/services/execute.commands.service
