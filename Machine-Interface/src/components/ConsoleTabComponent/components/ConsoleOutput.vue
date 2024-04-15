<template>
  <div class="column bg-blue-grey-1">
    <div class="row justify-around items-center sticky-header">
      <q-toggle
        v-model="showExecutionTime"
        label="Show Execution Time"
        style="font-size: 15px"
        name="showTime"
      />
      <q-btn @click="clearScrollArea" label="Clear" color="primary" />
    </div>
    <q-virtual-scroll
      :items="consoleTextList"
      :item-size="50"
      ref="scrollAreaRef"
      :bar-style="{ borderRadius: '5px', background: 'brown' }"
      class="scroll-area q-mb-lg"
      @virtual-scroll="onVirtualScroll"
    >
      <template v-slot="{ item }">
        <div class="q-pa-md">
          <span v-if="showExecutionTime">{{ item.time }} -</span>
          {{ item.text }}
        </div>
      </template>
    </q-virtual-scroll>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useConsoleOutputStore } from 'src/stores/console-output';
import { QVirtualScroll } from 'quasar';

const store = useConsoleOutputStore();
const { consoleTextList, showExecutionTime } = storeToRefs(store);
const scrollAreaRef = ref<QVirtualScroll | null>(null);
const autoScrollEnabled = ref(true);

// when the page mounted scroll to the end
onMounted(() => {
  if (scrollAreaRef.value) {
    scrollAreaRef.value.scrollTo(consoleTextList.value.length);
  }
});

const clearScrollArea = () => store.clearExecutedCommandsList();

const onVirtualScroll = ({ index }: { index: number }) => {
  // If the user is at the bottom of the scroll area
  if (index < consoleTextList.value.length - 10) {
    // User is not at the bottom, disable auto-scrolling
    autoScrollEnabled.value = false;
  } else {
    // User is at the bottom, enable auto-scrolling
    autoScrollEnabled.value = true;
  }
};

watch(consoleTextList.value, () => {
  // If auto-scrolling is enabled, scroll to the bottom
  if (autoScrollEnabled.value && scrollAreaRef.value) {
    scrollAreaRef.value.scrollTo(consoleTextList.value.length);
  }
});
</script>

<style scoped>
.scroll-area {
  height: 60vh;
  border-radius: 10px;
}
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px;
}
</style>
