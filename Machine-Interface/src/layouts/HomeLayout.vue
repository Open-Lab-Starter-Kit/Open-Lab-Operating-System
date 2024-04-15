<template>
  <q-layout view="lHr lpR lFr">
    <div v-if="isMobile">
      <q-header class="bg-white">
        <q-toolbar>
          <q-btn
            v-if="isMobile"
            flat
            @click="leftDrawer = !leftDrawer"
            round
            dense
            icon="menu"
            color="black"
          />
          <q-toolbar-title></q-toolbar-title>
          <q-btn
            v-if="isMobile"
            flat
            @click="rightDrawer = !rightDrawer"
            round
            dense
            icon="menu"
            color="black"
          />
        </q-toolbar>
      </q-header>
    </div>

    <q-drawer
      v-model="leftDrawer"
      show-if-above
      :width="100"
      :behavior="isMobile ? 'mobile' : 'desktop'"
      :overlay="isMobile ? true : false"
      class="column bg-grey-4 flex-center"
    >
      <div class="row flex-center col-1">
        <machine-logo />
      </div>
      <div class="col-11 full-width">
        <tabs />
      </div>
    </q-drawer>

    <q-drawer
      side="right"
      v-model="rightDrawer"
      show-if-above
      :width="
        isMobile ? ($q.screen.width * 50) / 100 : ($q.screen.width * 30) / 100
      "
      :behavior="isMobile ? 'mobile' : 'desktop'"
      :overlay="isMobile ? true : false"
      class="row flex-center q-px-md bg-grey-4"
    >
      <main-controls />
    </q-drawer>

    <q-page-container>
      <router-view />
      <machine-debugger />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import Tabs from '../components/TabsComponent.vue';
import MachineLogo from '../components/MachineLogoComponent.vue';
import MainControls from 'src/components/MainControlsComponent/MainControlsComponent.vue';
import MachineDebugger from 'src/components/MachineDebugger.vue';

const $q = useQuasar();
// drawer events
const leftDrawer = ref(false);
const rightDrawer = ref(false);

// Check the screen size on mount
const isMobile = ref(false);

if ($q.screen.lt.sm) {
  isMobile.value = true;
  leftDrawer.value = true;
  rightDrawer.value = true;
}
</script>
