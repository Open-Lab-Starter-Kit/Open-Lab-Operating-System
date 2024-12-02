<template>
  <override-settings-vinyl-cutter
    v-if="config?.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER"
  />
  <override-settings-laser-cutter
    v-else-if="config?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER"
  />
  <override-settings-cnc
    v-else-if="config?.machine_type === Constants.MACHINE_TYPE.CNC"
  />
</template>
<script setup lang="ts">
import OverrideSettingsVinylCutter from './components/overrideSettingsVinylCutter/OverrideSettingsVinylCutter.vue';
import OverrideSettingsLaserCutter from './components/overrideSettingsLaserCutter/OverrideSettingsLaserCutter.vue';
import OverrideSettingsCnc from './components/overrideSettingsCNC/OverrideSettingsCNC.vue';
import { onMounted, ref } from 'vue';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { Config } from 'src/interfaces/configSettings.interface';
import { Constants } from 'src/constants';

const config = ref<Config | null>(null);
onMounted(async () => {
  config.value = await configurationSettings();
});
</script>
<style>
.button-size {
  font-size: 15px;
  width: 60px;
  height: 60px;
  padding: 5px 5px 5px 5px;
}

.small-font {
  font-size: 1.5vh;
}
.large-font {
  font-size: 20px;
  font-weight: bold;
}
</style>
