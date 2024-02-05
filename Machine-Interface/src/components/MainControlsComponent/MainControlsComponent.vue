<template>
  <company-logo />
  <machine-state />
  <machine-position />
  <job-position />
  <job-info />
  <job-controllers />
  <job-estimated-time />
</template>

<script setup lang="ts">
import CompanyLogo from './components/CompanyLogo.vue';
import MachineState from './components/MachineState.vue';
import MachinePosition from './components/MachinePosition.vue';
import JobPosition from './components/JobPosition.vue';
import JobInfo from './components/JobInfo.vue';
import JobControllers from './components/JobControllers.vue';
import JobEstimatedTime from './components/JobEstimatedTime.vue';
</script>
