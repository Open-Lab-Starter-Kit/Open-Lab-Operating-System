<template>
  <div class="column col q-pa-md">
    <console-output />
    <serial-command-input />
    <debugger-button />
  </div>
</template>

<script setup lang="ts">
import SerialCommandInput from './components/SerialCommandInput.vue';
import ConsoleOutput from './components/ConsoleOutput.vue';
import DebuggerButton from './components/DebuggerButton.vue';
</script>
