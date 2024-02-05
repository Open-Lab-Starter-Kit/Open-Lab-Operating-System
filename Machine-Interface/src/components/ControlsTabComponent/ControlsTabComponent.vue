<template>
  <div class="column flex-center q-px-md q-gutter-y-md">
    <div class="row full-width justify-center q-gutter-sm">
      <critical-buttons />
      <jog-step />
      <jog-speed />
    </div>
    <div class="row full-width bg-grey-4 q-gutter-sm q-py-sm rounded-borders">
      <jog-buttons />
    </div>
    <div class="column full-width bg-grey-4 q-gutter-sm rounded-borders">
      <override-file-settings />
    </div>
  </div>
</template>

<script setup lang="ts">
import CriticalButtons from './components/CriticalButtonsComponent/CriticalButtons.vue';
import JogStep from './components/JogStepComponent/JogStep.vue';
import JogSpeed from './components/JogSpeedComponent/JogSpeed.vue';
import JogButtons from './components/JogButtonsComponent/JogButtons.vue';
import OverrideFileSettings from './components/OverrideSettingsComponent/OverrideSettings.vue';
</script>
