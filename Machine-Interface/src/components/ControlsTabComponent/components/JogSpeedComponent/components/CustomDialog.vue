<template>
  <q-dialog v-model="dialogVisible" persistent>
    <!-- Dialog content -->
    <q-card class="full-width q-pa-sm bg-blue-grey-1">
      <q-card-section class="row items-center q-pa-sm">
        <div class="text-h6">Custom {{ jogAxis }} Jogging Speed Value</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
          @click="closeDialog"
        />
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="inputValue"
          outlined
          type="number"
          placeholder="Enter a number"
          :rules="[
            (val: number) => !!val || '* Required',
            (val: number) => val > 0 || 'Only positive numbers are allowed.',
            (val: number) =>
              val <= 10000 || 'Number must be less than or equal to 10000.',
          ]"
          lazy-rules
          input-style="font-size: 30px"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn label="Clear" color="red-8" @click="clearCustomValue" />
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

const emit = defineEmits(['update:modelValue', 'dialogSet', 'dialogClear']);

const dialogVisible = ref(modelValue);
const inputValue = ref(props.jogValue);

// Watch for changes to the jog-value prop and update inputValue accordingly
watch(
  () => props.jogValue,
  (newValue) => {
    inputValue.value = newValue;
  }
);

// Watch for changes to the input value and update it to zero decimal number
watch(
  () => inputValue.value,
  (newValue) => {
    inputValue.value = parseInt(newValue.toString());
  }
);

// Watch for changes to the input value to make sure if the set button disabled
const isSetButtonDisabled = computed(() => {
  if (inputValue.value && inputValue.value > 0 && inputValue.value <= 10000)
    return false;
  return true;
});

// Methods
const setCustomValue = () => {
  emit('dialogSet', inputValue.value);
  closeDialog();
};

const clearCustomValue = () => {
  emit('dialogClear');
  closeDialog();
};

const closeDialog = () => {
  dialogVisible.value = false;
};
</script>
