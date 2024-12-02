<template>
  <div class="column bg-blue-grey-1">
    <div class="row justify-around items-center sticky-header">
      <q-toggle
        v-model="showExecutionTime"
        label="Show Timestamps"
        style="font-size: 15px"
        name="showTime"
      />
      <q-btn @click="clearScrollArea" label="Clear" color="primary" />
    </div>
    <q-virtual-scroll
      :items="consoleTextList"
      ref="scrollAreaRef"
      :bar-style="{ borderRadius: '5px', background: 'brown' }"
      class="scroll-area q-mb-lg bg-blue-grey-1"
      @virtual-scroll="onScroll"
      @pointerdown.prevent="handlePointerScroll"
      virtual-scroll-slice-size="100"
      :items-size="10"
    >
      <template v-slot="{ item }">
        <div class="q-pa-xs">
          <span v-if="showExecutionTime">{{ item.time }} -</span>
          {{ item.text }}
        </div>
      </template>
    </q-virtual-scroll>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useConsoleOutputStore } from 'src/stores/console-output';
import { QVirtualScroll } from 'quasar';

const store = useConsoleOutputStore();
const { consoleTextList, showExecutionTime } = storeToRefs(store);
const scrollAreaRef = ref<QVirtualScroll | null>(null);
const autoScroll = ref(false);

const handlePointerScroll = () => {
  autoScroll.value = false;
};

const clearScrollArea = () => store.clearExecutedCommandsList();

const onScroll = ({ index }: { index: number }) => {
  if (
    (scrollAreaRef.value && autoScroll.value) ||
    index >= consoleTextList.value.length - 20
  ) {
    // User is at the bottom, enable auto-scrolling
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  if (scrollAreaRef.value) {
    autoScroll.value = true;
    scrollAreaRef.value.scrollTo(consoleTextList.value.length);
  }
};

// when the page mounted scroll to the end
onMounted(() => {
  scrollToBottom();
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
.scroll-btn {
  position: fixed;
  right: 25px;
  bottom: 10px;
}
</style>
