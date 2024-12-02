<template>
  <div class="column q-gutter-y-lg">
    <div class="row items-center col">
      <span class="text-size">Laser Power:</span>
      <q-input
        v-model.number="laserPower"
        type="number"
        :min="config?.laser_cutter_settings?.gcode_generator.laser_power.min"
        :max="config?.laser_cutter_settings?.gcode_generator.laser_power.max"
        outlined
        dense
        suffix="%"
        :error-message="errorMessage()"
        :error="!isValidPower"
        class="col"
        @update:model-value="handleChangePowerValue"
      />
    </div>
    <div class="row items-center col">
      <span class="text-size">Movement Speed:</span>
      <q-input
        v-model.number="movementSpeed"
        type="number"
        :min="config?.laser_cutter_settings?.gcode_generator.movement_speed.min"
        :max="config?.laser_cutter_settings?.gcode_generator.movement_speed.max"
        outlined
        dense
        suffix="mm/min"
        :error-message="errorMessage(true)"
        :error="!isValidSpeed"
        class="col"
        @update:model-value="handleChangeSpeedValue"
      />
    </div>
    <div class="row items-center col">
      <span class="text-size">Used Tool:</span>
      <div
        v-for="(toolName, toolNum) in config?.laser_cutter_settings?.tools"
        :key="toolNum"
      >
        <q-radio
          v-model="laserTool"
          :val="toolName.name"
          :label="toolName.name"
          size="lg"
          keep-color
          @update:model-value="(newValue) => emit('update:tool', newValue)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Config } from 'src/interfaces/configSettings.interface';
import { ref, watch } from 'vue';

const props = defineProps<{
  config: Config | null;
  power: number;
  speed: number;
  tool: string;
  isValidPower: boolean;
  isValidSpeed: boolean;
}>();

const emit = defineEmits([
  'update:power',
  'update:speed',
  'update:tool',
  'update:isValidPower',
  'update:isValidSpeed',
]);

const laserPower = ref<number>(props.power);
const movementSpeed = ref<number>(props.speed);
const laserTool = ref<string>(props.tool);
const isValidLaserPower = ref<boolean>(props.isValidPower);
const isValidMovementSpeed = ref<boolean>(props.isValidSpeed);

const handleChangeSpeedValue = (newSpeed: number | string | null) => {
  if (typeof newSpeed === 'number') {
    emit('update:speed', newSpeed);
    isValidMovementSpeed.value = props.config?.laser_cutter_settings
      ? newSpeed <=
          props.config.laser_cutter_settings.gcode_generator.movement_speed
            .max &&
        newSpeed >
          props.config.laser_cutter_settings.gcode_generator.movement_speed.min
      : false;
  } else {
    isValidMovementSpeed.value = false;
  }
};

const handleChangePowerValue = (newPower: number | string | null) => {
  if (typeof newPower === 'number') {
    emit('update:power', newPower);
    isValidLaserPower.value = props.config?.laser_cutter_settings
      ? newPower <=
          props.config.laser_cutter_settings.gcode_generator.laser_power.max &&
        newPower >
          props.config.laser_cutter_settings.gcode_generator.laser_power.min
      : false;
  } else {
    isValidLaserPower.value = false;
  }
};

const errorMessage = (isSpeedError = false) => {
  if (isSpeedError && props.config?.laser_cutter_settings) {
    const minValue =
      props.config.laser_cutter_settings.gcode_generator.movement_speed.min;
    const maxValue =
      props.config.laser_cutter_settings.gcode_generator.movement_speed.max;
    return `The value should be between ${minValue} and ${maxValue}`;
  } else if (props.config?.laser_cutter_settings) {
    const minValue =
      props.config.laser_cutter_settings.gcode_generator.laser_power.min;
    const maxValue =
      props.config.laser_cutter_settings.gcode_generator.laser_power.max;
    return `The value should be between ${minValue} and ${maxValue}`;
  }
};

// emit the changes on the validation flags
watch(isValidLaserPower, (newIsValidLaserPower) => {
  emit('update:isValidPower', newIsValidLaserPower);
});

watch(isValidMovementSpeed, (newIsValidLMovementSpeed) => {
  emit('update:isValidSpeed', newIsValidLMovementSpeed);
});
</script>
src/interfaces/configSettings.interface
