<template>
  <div class="column col q-gutter-y-sm">
    <div class="row col q-py-sm items-center justify-around">
      <span class="axis-title">Z</span>
      <span class="text-bold">{{ zJogSpeed }} mm/s</span>
      <q-btn
        outline
        round
        :icon="isCustomZSpeedValue ? 'close' : 'edit'"
        color="light-grey-4"
        size="md"
        :disable="isDisabled"
        @click="
          isCustomZSpeedValue ? clearZSpeedCustom() : openZCustomSpeedDialog()
        "
      />
    </div>
    <q-btn-group flat push rounded class="col flex-center">
      <q-btn
        outline
        label="slow"
        :class="[{ 'bg-white': zChosenSpeed === 'slow' }, 'group-button-width']"
        :disable="isDisabled"
        @click="setZSpeed"
      />
      <q-btn
        outline
        label="normal"
        :class="[
          { 'bg-white': zChosenSpeed === 'normal' },
          'group-button-width',
        ]"
        :disable="isDisabled"
        @click="setZSpeed"
      />
      <q-btn
        outline
        label="fast"
        :class="[{ 'bg-white': zChosenSpeed === 'fast' }, 'group-button-width']"
        :disable="isDisabled"
        @click="setZSpeed"
      />
    </q-btn-group>
    <!-- Dialog Component -->
    <custom-dialog
      v-model="dialogVisible"
      :jog-value="zJogSpeed"
      jog-axis="Z"
      @dialogSet="setZCustomSpeed"
      @dialogClear="clearZSpeedCustom"
    />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useJogControlsStore } from 'src/stores/jog-controls';
import CustomDialog from './CustomDialog.vue';
import { ref } from 'vue';

defineProps<{
  isDisabled: boolean;
}>();

const store = useJogControlsStore();

const { zJogSpeed, zChosenSpeed, isCustomZSpeedValue } = storeToRefs(store);

const dialogVisible = ref(false);

const setZSpeed = (event: Event) => {
  // Type assertion to HTMLElement or null
  const targetElement = event.target as HTMLElement | null;

  // Check if targetElement is not null and has textContent property
  if (targetElement && targetElement.textContent) {
    store.setZSpeedChoice(targetElement.textContent);
    isCustomZSpeedValue.value = false;
  }
};

const openZCustomSpeedDialog = () => {
  dialogVisible.value = true;
};

const setZCustomSpeed = (newValue: number) => {
  zJogSpeed.value = newValue;
  zChosenSpeed.value = '';
  isCustomZSpeedValue.value = true;
};

const clearZSpeedCustom = () => {
  // reset to its init value
  zJogSpeed.value = 10;
  zChosenSpeed.value = 'slow';
  // Re-enable the slider
  isCustomZSpeedValue.value = false;
};
</script>
