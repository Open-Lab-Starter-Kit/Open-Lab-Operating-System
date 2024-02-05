<template>
  <div class="q-px-md">
    <console-output />
    <serial-command-input />
    <messages-output />
  </div>
</template>

<script setup lang="ts">
import SerialCommandInput from './components/SerialCommandInput.vue';
import ConsoleOutput from './components/ConsoleOutput.vue';
import MessagesOutput from './components/MessagesOutput.vue';
</script>
