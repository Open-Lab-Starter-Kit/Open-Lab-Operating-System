<template>
  <div class="column col q-gutter-y-sm">
    <div class="row col q-py-sm items-center justify-around">
      <span class="axis-title">Z</span>
      <span>{{ zJogSpeed }} mm/s</span>
      <q-btn
        outline
        round
        icon="edit"
        color="light-grey-4"
        size="md"
        :disable="isDisabled"
        @click="openZCustomSpeedDialog"
      />
    </div>
    <q-btn-group flat push rounded class="col flex-center">
      <q-btn
        outline
        label="slow"
        :class="[{ 'bg-white': zChosenSpeed === 'slow' }, 'group-button-width']"
        :disable="isButtonsGroupDisabled()"
        @click="setZSpeed"
      />
      <q-btn
        outline
        label="normal"
        :class="[
          { 'bg-white': zChosenSpeed === 'normal' },
          'group-button-width',
        ]"
        :disable="isButtonsGroupDisabled()"
        @click="setZSpeed"
      />
      <q-btn
        outline
        label="fast"
        :class="[{ 'bg-white': zChosenSpeed === 'fast' }, 'group-button-width']"
        :disable="isButtonsGroupDisabled()"
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

const props = defineProps<{
  isDisabled: boolean;
}>();

const store = useJogControlsStore();

const { zJogSpeed, zChosenSpeed, isCustomZSpeedValue } = storeToRefs(store);

const dialogVisible = ref(false);

const isButtonsGroupDisabled = () => {
  if (props.isDisabled || isCustomZSpeedValue.value) return true;
  return false;
};

const setZSpeed = (event: Event) => {
  // Type assertion to HTMLElement or null
  const targetElement = event.target as HTMLElement | null;

  // Check if targetElement is not null and has textContent property
  if (targetElement && targetElement.textContent) {
    store.setZSpeedChoice(targetElement.textContent);
  }
};

const openZCustomSpeedDialog = () => {
  dialogVisible.value = true;
};

const setZCustomSpeed = (newValue: number) => {
  zJogSpeed.value = newValue;
  isCustomZSpeedValue.value = true;
};

const clearZSpeedCustom = () => {
  // reset to its init value
  zJogSpeed.value = 10;
  // Re-enable the slider
  isCustomZSpeedValue.value = false;
};
</script>
