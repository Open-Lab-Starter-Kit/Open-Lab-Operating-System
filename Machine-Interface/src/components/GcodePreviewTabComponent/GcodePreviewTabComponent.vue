<template>
  <div class="column q-pa-sm">
    <div class="column q-py-lg">
      <main-buttons />
    </div>
    <graph-component />
    <job-coordinates />
  </div>
</template>
<script setup lang="ts">
import MainButtons from './components/MainButtons.vue';
import GraphComponent from './components/GraphComponent.vue';
import JobCoordinates from './components/JobCoordinates.vue';
</script>
