<template>
  <span style="font-size: 1rem">Override Settings</span>
  <div class="row q-gutter-y-sm full-width justify-around">
    <feed-rate />
    <laser-power />
  </div>
</template>
<script setup lang="ts">
import FeedRate from './components/FeedRate.vue';
import LaserPower from './components/LaserPower.vue';
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
