<template>
  <q-scroll-area
    ref="scrollAreaRef"
    :bar-style="{ borderRadius: '5px', background: 'brown' }"
    class="scroll-area q-mb-lg bg-blue-grey-1"
  >
    <div class="row justify-around items-center sticky-header bg-blue-grey-1">
      <q-toggle
        v-model="showExecutionTime"
        label="Show Execution Time"
        style="font-size: 15px"
      />
      <q-btn @click="clearScrollArea" label="Clear" color="primary" />
    </div>
    <div class="q-pa-md bg-blue-grey-1">
      <div v-for="(command, index) in consoleTextList" :key="index">
        <span v-if="showExecutionTime">{{ command.time }} -</span>
        {{ command.text }}
      </div>
    </div>
  </q-scroll-area>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useConsoleOutputStore } from 'src/stores/console-output';
import { QScrollArea } from 'quasar';

const store = useConsoleOutputStore();
const { consoleTextList } = storeToRefs(store);
const showExecutionTime = ref(true);
const scrollAreaRef = ref<QScrollArea | null>(null);

const clearScrollArea = () => store.clearExecutedCommandsList();

// scroll to the end of the area on first mount
onMounted(() => {
  scrollToBottom();
});

// Watch for changes in executedCommand and update the scroll area
watch(
  () => consoleTextList.value.length,
  () => {
    scrollToBottom();
  }
);

const scrollToBottom = () => {
  if (scrollAreaRef.value) {
    scrollAreaRef.value.setScrollPercentage('vertical', 1);
  }
};
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
