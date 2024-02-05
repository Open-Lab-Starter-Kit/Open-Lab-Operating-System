<template>
  <div class="column col-md-2 col-sm-12 col-xs-12">
    <home-button />
    <div class="row q-gutter-sm justify-between">
      <unlock-button />
      <soft-reset-button />
    </div>
  </div>
</template>

<script setup lang="ts">
import HomeButton from './components/HomeButton.vue';
import UnlockButton from './components/UnlockButton.vue';
import SoftResetButton from './components/SoftResetButton.vue';
</script>
