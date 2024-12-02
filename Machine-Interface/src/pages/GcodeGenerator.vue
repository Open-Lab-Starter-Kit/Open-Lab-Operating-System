<template>
  <q-page>
    <gcode-generator
      v-if="config?.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER"
    />
  </q-page>
</template>

<script setup lang="ts">
import GcodeGenerator from 'src/components/GcodeGeneratorTabComponent/GcodeGeneratorTabComponent.vue';
import { Constants } from 'src/constants';
import { Config } from 'src/interfaces/configSettings.interface';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { onMounted, ref } from 'vue';

const config = ref<Config | null>(null);

onMounted(async () => {
  config.value = await configurationSettings();
});
</script>
