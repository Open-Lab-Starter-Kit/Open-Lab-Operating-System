<template>
  <div class="column q-gutter-y-md q-py-md">
    <div class="row items-center q-gutter-sm">
      <q-btn
        label="-10%"
        class="button-size"
        icon="fast_rewind"
        color="white"
        text-color="blue-grey-10"
        push
        stack
        @click="store.decreaseFeedRateTenPercent"
        :disable="feedRate < 10"
      />
      <q-btn
        class="button-size"
        color="white"
        text-color="blue-grey-10"
        push
        stack
        @click="store.decreaseFeedRateOnePercent"
        :disable="feedRate < 1"
      >
        <q-icon name="play_arrow" class="rotate-180" />
        <span>-1%</span>
      </q-btn>
      <div class="column items-center">
        <span class="small-font">Feed Rate</span>
        <span class="large-font">{{ feedRate }}%</span>
      </div>
      <q-btn
        label="+1%"
        class="button-size"
        icon="play_arrow"
        color="white"
        text-color="blue-grey-10"
        push
        stack
        @click="store.increaseFeedRateOnePercent"
        :disable="feedRate > 129"
      />
      <q-btn
        label="+10%"
        class="button-size"
        icon="fast_forward"
        color="white"
        text-color="blue-grey-10"
        push
        stack
        @click="store.increaseFeedRateTenPercent"
        :disable="feedRate > 120"
      />
    </div>
    <q-btn
      label="Default Feed Rate"
      icon="restart_alt"
      color="white"
      class="full-width"
      text-color="blue-grey-10"
      push
      stack
      @click="store.defaultFeedRate"
    />
  </div>
</template>
<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useOverrideSettingsStore } from 'src/stores/override-settings';

const store = useOverrideSettingsStore();

const { feedRate } = storeToRefs(store);
</script>
