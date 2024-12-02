<template>
  <div class="column col items-center justify-evenly q-px-md">
    <div class="row fit justify-center q-gutter-x-sm">
      <critical-buttons />
      <jog-step :config="config" />
      <jog-speed :config="config" />
    </div>
    <jog-buttons :config="config" />
    <tools-changer
      v-if="config?.machine_type !== Constants.MACHINE_TYPE.VINYL_CUTTER"
    />
    <override-file-settings :config="config" />
  </div>
</template>

<script setup lang="ts">
import CriticalButtons from './components/CriticalButtonsComponent/CriticalButtons.vue';
import JogStep from './components/JogStepComponent/JogStep.vue';
import JogSpeed from './components/JogSpeedComponent/JogSpeed.vue';
import JogButtons from './components/JogButtonsComponent/JogButtons.vue';
import OverrideFileSettings from './components/OverrideSettingsComponent/OverrideSettings.vue';
import ToolsChanger from './components/ToolsChangerComponent/ToolsChanger.vue';
import { onMounted, ref } from 'vue';
import { Config } from 'src/interfaces/configSettings.interface';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { Constants } from 'src/constants';

const config = ref<Config | null>(null);

onMounted(async () => {
  config.value = await configurationSettings();
});
</script>
