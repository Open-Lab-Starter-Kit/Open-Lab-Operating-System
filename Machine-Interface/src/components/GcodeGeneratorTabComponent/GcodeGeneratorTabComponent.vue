<template>
  <div class="column q-pa-lg q-gutter-y-md">
    <SVG-viewer />
    <q-card>
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab name="mapping" icon="grid_on" label="Mapping" />
        <q-tab name="settings" icon="settings" label="Settings" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="mapping">
          <SVG-mapping />
        </q-tab-panel>

        <q-tab-panel name="settings">
          <gcode-file-settings />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>
<script setup lang="ts">
import SVGViewer from './components/ImageViewer.vue';
import SVGMapping from './components/ImageMapping.vue';
import GcodeFileSettings from './components/GcodeFileSettings.vue';
import { ref } from 'vue';

const tab = ref('mapping');
</script>
<style scoped></style>
