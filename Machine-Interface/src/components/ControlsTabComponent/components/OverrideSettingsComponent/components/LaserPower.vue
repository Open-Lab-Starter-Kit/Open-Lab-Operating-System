<template>
  <div class="column q-gutter-y-md q-py-md">
    <div class="row items-center q-gutter-sm">
      <q-btn
        label="-10%"
        class="button-size"
        icon="fast_rewind"
        color="white"
        text-color="blue-grey-10"
        push
        stack
        @click="store.decreaseLaserPowerTenPercent"
        :disable="laserPower < 10"
      />
      <q-btn
        class="button-size"
        color="white"
        text-color="blue-grey-10"
        push
        stack
        @click="store.decreaseLaserPowerOnePercent"
        :disable="laserPower < 1"
      >
        <q-icon name="play_arrow" class="rotate-180" />
        <span>-1%</span>
      </q-btn>
      <div class="column items-center">
        <span class="small-font">Laser Power</span>
        <span class="large-font">{{ laserPower }}%</span>
      </div>
      <q-btn
        label="+1%"
        class="button-size"
        icon="play_arrow"
        color="white"
        text-color="blue-grey-10"
        push
        stack
        @click="store.increaseLaserPowerOnePercent"
        :disable="laserPower > 129"
      />
      <q-btn
        label="+10%"
        class="button-size"
        icon="fast_forward"
        color="white"
        text-color="blue-grey-10"
        push
        stack
        @click="store.increaseLaserPowerTenPercent"
        :disable="laserPower > 120"
      />
    </div>
    <q-btn
      label="Default Laser Power"
      icon="restart_alt"
      color="white"
      class="full-width"
      text-color="blue-grey-10"
      push
      stack
      @click="store.defaultLaserPower"
    />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useOverrideSettingsStore } from 'src/stores/override-settings';

const store = useOverrideSettingsStore();

const { laserPower } = storeToRefs(store);
</script>
