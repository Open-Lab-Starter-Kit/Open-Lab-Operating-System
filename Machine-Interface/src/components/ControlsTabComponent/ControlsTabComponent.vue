<template>
  <div class="column col flex-center q-px-md q-gutter-y-sm">
    <div class="row full-width justify-center q-gutter-sm">
      <critical-buttons />
      <jog-step />
      <jog-speed />
    </div>
    <jog-buttons />
    <override-file-settings />
  </div>
</template>

<script setup lang="ts">
import CriticalButtons from './components/CriticalButtonsComponent/CriticalButtons.vue';
import JogStep from './components/JogStepComponent/JogStep.vue';
import JogSpeed from './components/JogSpeedComponent/JogSpeed.vue';
import JogButtons from './components/JogButtonsComponent/JogButtons.vue';
import OverrideFileSettings from './components/OverrideSettingsComponent/OverrideSettings.vue';
</script>
