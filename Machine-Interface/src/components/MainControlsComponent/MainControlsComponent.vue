<template>
  <div
    class="column full-width items-center justify-evenly"
    style="min-height: 100%"
  >
    <company-logo />
    <machine-state />
    <machine-position :config="config" />
    <job-position :config="config" />
    <file-and-machine-info :config="config" />
    <job-controls />
    <job-estimated-time />
  </div>
</template>

<script setup lang="ts">
import CompanyLogo from './components/CompanyLogo.vue';
import MachineState from './components/MachineState.vue';
import MachinePosition from './components/MachinePosition.vue';
import JobPosition from './components/JobPosition.vue';
import FileAndMachineInfo from './components/MachineInfo/FileAndMachineInfo.vue';
import JobControls from './components/JobControls.vue';
import JobEstimatedTime from './components/JobEstimatedTime.vue';
import { onMounted, ref } from 'vue';
import { configurationSettings } from 'src/services/configuration.loader.service';
import { Config } from 'src/interfaces/configSettings.interface';

const config = ref<Config | null>(null);
onMounted(async () => {
  config.value = await configurationSettings();
});
</script>
