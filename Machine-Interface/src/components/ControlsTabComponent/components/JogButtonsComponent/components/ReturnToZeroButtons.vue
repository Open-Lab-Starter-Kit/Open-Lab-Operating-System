<template>
  <div class="column col col-md col-sm-5 col-xs-5 flex-center q-py-md">
    <q-btn
      label="Return to zero"
      color="white"
      stack
      text-color="blue-grey-10"
      class="button-size"
      push
      size="md"
      @click="returnToZero"
      :disable="isDisabled"
    />
  </div>
</template>

<script setup lang="ts">
import { Constants } from 'src/constants';
import { executeNormalGCommands } from 'src/services/execute.commands.service';

defineProps<{
  isDisabled: boolean;
}>();

const returnToZero = () => {
  executeNormalGCommands(Constants.GRBL_COMMAND_RETURN_ZERO);
};
</script>
<style scoped>
.button-size {
  font-size: 20px;
  width: 100px;
  height: 100px;

  i {
    padding: 0;
    margin: -5;
  }
}
</style>
src/services/execute.commands.service
