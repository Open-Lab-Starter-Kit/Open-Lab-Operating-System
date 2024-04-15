<template>
  <q-dialog v-model="dialogVisible" persistent>
    <!-- Dialog content -->
    <q-card class="full-width q-pa-sm bg-blue-grey-1">
      <q-card-section class="row items-center q-pa-sm">
        <span style="font-size: 20px"
          >Customize {{ jogAxis }} Jogging Step Value</span
        >
        <q-space />
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="inputValue"
          placeholder="Enter a number"
          type="number"
          outlined
          min="0"
          max="10000"
          step=".1"
          :rules="[
            (val: number) => !!val || '* Required',
            (val: number) => val > 0 || 'Only positive numbers are allowed.',
            (val: number) =>
              val <= 1000 || 'Number must be less than or equal to 1000.',
          ]"
          reactive-rules
          lazy-rules
          @keydown="sanitizeInput"
          input-style="font-size: 30px"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" @click="closeDialog" />
        <q-btn
          label="Set"
          color="primary"
          @click="setCustomValue"
          :disable="isSetButtonDisabled"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  jogAxis: string;
  jogValue: number;
}>();

const modelValue = defineModel<boolean>();

const emit = defineEmits(['update:modelValue', 'dialogSet']);

const dialogVisible = ref(modelValue);
const inputValue = ref(props.jogValue);

// Watch for changes to the jog-value prop and update inputValue accordingly
watch(
  () => props.jogValue,
  (newValue) => {
    inputValue.value = newValue;
  }
);

// Watch for changes to the input value and update it to one decimal number
watch(
  () => inputValue.value,
  (newValue) => {
    // Parse the string value to a float and round it to one decimal place
    const roundedValue = parseFloat(newValue.toString()).toFixed(1);

    // Convert the rounded value back to a number
    inputValue.value = parseFloat(roundedValue);
  }
);

// Watch for changes to the input value to make sure if the set button disabled
const isSetButtonDisabled = computed(() => {
  if (inputValue.value && inputValue.value > 0 && inputValue.value <= 1000)
    return false;
  return true;
});

// Methods
const setCustomValue = () => {
  emit('dialogSet', inputValue.value);
  closeDialog();
};

const closeDialog = () => {
  dialogVisible.value = false;
};

const sanitizeInput = (event: KeyboardEvent) => {
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
  // Regular expression to match numbers with up to 4 real numbers and 1 decimal
  const regex = /^\d{0,3}(\.\d{0,1})?$/;
  const target = event.target as HTMLInputElement;
  const isValid = regex.test(target.value);

  if (
    !isValid &&
    event.key !== 'Backspace' &&
    event.key !== 'Delete' &&
    event.key !== 'ArrowLeft' &&
    event.key !== 'ArrowRight' &&
    event.key !== 'ArrowUp' &&
    event.key !== 'ArrowDown'
  )
    event.preventDefault();
};
</script>
