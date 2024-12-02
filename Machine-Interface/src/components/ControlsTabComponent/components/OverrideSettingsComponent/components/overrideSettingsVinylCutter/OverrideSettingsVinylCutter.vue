<template>
  <div class="column full-width bg-grey-4 q-gutter-sm rounded-borders">
    <span class="text-bold" style="font-size: 1rem">Override Settings</span>
    <div class="row q-gutter-sm full-width justify-around">
      <feed-rate />
      <tool-power />
    </div>
  </div>
</template>
<script setup lang="ts">
import FeedRate from './components/FeedRate.vue';
import ToolPower from './components/ToolPower.vue';
</script>
<style>
.button-size {
  font-size: 15px;
  width: 60px;
  height: 60px;
  padding: 5px 5px 5px 5px;
}

.small-font {
  font-size: 1.5vh;
}
.large-font {
  font-size: 20px;
  font-weight: bold;
}
</style>
