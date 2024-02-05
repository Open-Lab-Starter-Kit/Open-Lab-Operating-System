<template>
  <div
    class="column items-between justify-start messages-output-box bg-blue-grey-1 q-px-xl q-py-md q-mb-lg"
    :class="{
      'border-red': isError,
    }"
  >
    <p class="message-title">{{ messageTitle }}</p>
    <p>
      {{ messageContent }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useMessageOutputStore } from 'src/stores/message-output';

const store = useMessageOutputStore();
const { messageTitle, messageContent, isError } = storeToRefs(store);
</script>

<style scoped>
.messages-output-box {
  border: solid 2px;
  border-radius: 10px;
  font-size: 15px;
}
.message-title {
  text-transform: uppercase;
  font-weight: bold;
}
.border-red {
  border: #ef9a9a solid 2px;
}
</style>
