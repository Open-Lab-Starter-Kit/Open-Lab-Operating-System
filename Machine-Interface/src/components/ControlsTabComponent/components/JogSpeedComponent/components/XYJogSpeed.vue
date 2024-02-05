<template>
  <div class="column col q-gutter-y-sm">
    <div class="row col items-center justify-around">
      <span class="axis-title">XY</span>
      <span>{{ xyJogSpeed }} mm/s</span>
      <q-btn
        outline
        round
        icon="edit"
        color="light-grey-4"
        size="md"
        :disable="isDisabled"
        @click="openXYCustomSpeedDialog"
      />
    </div>
    <q-btn-group flat push rounded class="col flex-center full-width">
      <q-btn
        outline
        label="slow"
        :class="[
          { 'bg-white': xyChosenSpeed === 'slow' },
          'group-button-width',
        ]"
        :disable="isButtonsGroupDisabled()"
        @click="setXYSpeed"
      />
      <q-btn
        outline
        label="normal"
        :class="[
          { 'bg-white': xyChosenSpeed === 'normal' },
          'group-button-width',
        ]"
        :disable="isButtonsGroupDisabled()"
        @click="setXYSpeed"
      />
      <q-btn
        outline
        label="fast"
        :class="[
          { 'bg-white': xyChosenSpeed === 'fast' },
          'group-button-width',
        ]"
        :disable="isButtonsGroupDisabled()"
        @click="setXYSpeed"
      />
    </q-btn-group>
    <!-- Dialog Component -->
    <custom-dialog
      v-model="dialogVisible"
      :jog-value="xyJogSpeed"
      jog-axis="XY"
      @dialogSet="setXYCustomSpeed"
      @dialogClear="clearXYSpeedCustom"
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

const { xyJogSpeed, xyChosenSpeed, isCustomXYSpeedValue } = storeToRefs(store);

const dialogVisible = ref(false);

const isButtonsGroupDisabled = () => {
  if (props.isDisabled || isCustomXYSpeedValue.value) return true;
  return false;
};

const setXYSpeed = (event: Event) => {
  // Type assertion to HTMLElement or null
  const targetElement = event.target as HTMLElement | null;

  // Check if targetElement is not null and has textContent property
  if (targetElement && targetElement.textContent) {
    store.setXYSpeedChoice(targetElement.textContent);
  }
};

const openXYCustomSpeedDialog = () => {
  dialogVisible.value = true;
};

const setXYCustomSpeed = (newValue: number) => {
  xyJogSpeed.value = newValue;
  isCustomXYSpeedValue.value = true;
};

const clearXYSpeedCustom = () => {
  // reset to its init value
  xyJogSpeed.value = 10;
  // Re-enable the slider
  isCustomXYSpeedValue.value = false;
};
</script>
