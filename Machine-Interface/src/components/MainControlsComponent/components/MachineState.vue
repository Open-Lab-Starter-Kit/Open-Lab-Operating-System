<template>
  <div
    :class="[
      'col-2',
      'column',
      'q-pa-md',
      'q-my-sm',
      'flex-center',
      'full-width',
      {
        'bg-light-blue-3': state === Constants.IDLE,
        'bg-light-green-4': state === Constants.RUN,
        'bg-yellow': state === Constants.HOLD,
        'bg-white': state === Constants.DISCONNECTED,
        'bg-red-3': state === Constants.ALARM || isError,
      },
    ]"
    style="border-radius: 10px"
  >
    <span class="state-text">{{ state }}</span>
    <span class="small-note-text">{{ smallMessage }}</span>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { useMessageOutputStore } from 'src/stores/message-output';

const store = useMessageOutputStore();
const { state, smallMessage, isError } = storeToRefs(store);
</script>

<style scoped>
.state-text {
  font-size: x-large;
  color: gray;
  font-weight: bold;
  text-transform: uppercase;
}

.small-note-text {
  font-size: medium;
  color: gray;
  text-align: center;
}
</style>
