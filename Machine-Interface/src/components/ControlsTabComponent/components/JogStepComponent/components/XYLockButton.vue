<template>
  <!-- Lock Button -->
  <q-btn
    :icon="isXYLocked ? 'lock_open' : 'lock'"
    text-color="black"
    class="bg-white q-pa-xs lock-style"
    color="bg-white"
    outline
    push
    size="md"
    :disable="isDisabled"
    @click="jogControlsStore.changeXYLockStatus()"
    style="border-radius: 10px"
  >
    <q-tooltip class="bg-black">{{
      isXYLocked ? 'Unlock XY' : 'Lock XY'
    }}</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useJogControlsStore } from 'src/stores/jog-controls';
import { watch } from 'vue';

defineProps<{
  isDisabled: boolean;
}>();

const jogControlsStore = useJogControlsStore();

const { isXYLocked, xJogStep, yJogStep, xSliderValue, ySliderValue } =
  storeToRefs(jogControlsStore);

// check if x and y are locked together
watch(
  () => xJogStep.value,
  () => {
    if (isXYLocked.value) {
      ySliderValue.value = xSliderValue.value;
      yJogStep.value = xJogStep.value;
    }
  }
);
</script>
