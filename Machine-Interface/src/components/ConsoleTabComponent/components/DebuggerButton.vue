<template>
  <q-btn
    label="Debugger"
    icon="bug_report"
    size="lg"
    color="primary"
    class="self-end"
    @click="store.showDebuggerDialog"
  >
    <q-tooltip>Open Debugger</q-tooltip>
  </q-btn>
</template>

<script setup lang="ts">
import { useDebuggerDialogStore } from 'src/stores/debugger-dialog';

const store = useDebuggerDialogStore();
</script>

<style scoped>
.messages-output-box {
  border: solid 2px;
  border-radius: 10px;
  font-size: 15px;
}
.message-title {
  text-transform: uppercase;
  font-weight: bold;
}
.border-red {
  border: #ef9a9a solid 2px;
}
</style>
