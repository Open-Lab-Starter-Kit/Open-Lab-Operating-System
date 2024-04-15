<template>
  <router-view />
</template>

<script setup lang="ts">
import { useFileManagementStore } from './stores/file-management';
import { useWebSocketStore } from './stores/websocket-connection';
import { onMounted } from 'vue';

const fileManagerStore = useFileManagementStore();
const websocketStore = useWebSocketStore();

const { checkOpenFile } = fileManagerStore;

// Connect to WebSocket when component is mounted
onMounted(() => {
  websocketStore.connect(process.env.WEBSOCKET_URL || '');

  // Check if there is an already opened file in the system
  checkOpenFile();
});
</script>
