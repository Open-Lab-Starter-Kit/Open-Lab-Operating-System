<template>
  <q-dialog
    v-model="isDialogShown"
    persistent
    maximized
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="row fit bg-grey-9 text-white">
      <q-card-section class="fixed-top bg-grey-10" style="z-index: 1">
        <q-bar>
          <q-space />
          <q-btn
            dense
            flat
            icon="close"
            size="lg"
            @click="store.closeDebuggerDialog"
            class="q-pt-md"
          >
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>

        <div class="row items-center justify-evenly bg-grey-10">
          <q-toggle
            v-model="showSerialCommands"
            label="Serial Commands"
            style="font-size: 15px"
          />
          <q-toggle
            v-model="showConnectionMessages"
            label="Connection Messages"
            style="font-size: 15px"
          />
          <q-toggle
            v-model="showFileExecution"
            label="File Execution"
            style="font-size: 15px"
          />
          <q-toggle
            v-model="showFileManager"
            label="File Manager"
            style="font-size: 15px"
          />
          <q-toggle
            v-model="showMachineStatus"
            label="Machine Status"
            style="font-size: 15px"
          />
          <q-toggle
            v-model="showTimeStamp"
            label="Time"
            style="font-size: 15px"
          />
          <div class="row q-gutter-x-md">
            <q-btn @click="resetToggles" label="Reset" color="green">
              <q-tooltip class="bg-white text-primary">Reset Toggles</q-tooltip>
            </q-btn>
            <q-btn @click="clearScrollArea" label="Clear" color="primary">
              <q-tooltip class="bg-white text-primary">Clear Console</q-tooltip>
            </q-btn>
            <q-btn @click="store.downloadLogs" color="purple" label="Download">
              <q-tooltip class="bg-white text-primary">Download Logs</q-tooltip>
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <q-card-section class="scroll-area">
        <q-virtual-scroll
          :items="logs"
          ref="scrollAreaRef"
          :bar-style="{ borderRadius: '5px', background: 'brown' }"
          @virtual-scroll="onScroll"
          @pointerdown.prevent="handlePointerScroll"
          virtual-scroll-slice-size="100"
          :items-size="10"
        >
          <template v-slot="{ item }">
            <span
              v-if="
                showSerialCommands &&
                item.type === Constants.SERIAL_COMMAND_DATA_TYPE
              "
              class="row q-gutter-x-md text-h6"
              :key="item.id"
            >
              <span v-if="showTimeStamp">{{ item.time }}</span>
              <span>[{{ item.type }}]</span>
              <span>{{ item.text }}</span>
            </span>
            <span
              v-if="
                showConnectionMessages &&
                (item.type === Constants.CONNECTION_DATA_TYPE ||
                  item.type === Constants.CONNECTION_DATA_TYPE)
              "
              class="row q-gutter-x-md text-h6"
              :key="item.id"
            >
              <span v-if="showTimeStamp">{{ item.time }}</span>
              <span>[{{ item.type }}]</span>
              <span>{{ item.text }}</span>
            </span>
            <span
              v-if="
                showFileExecution &&
                item.type === Constants.JOB_EXECUTION_DATA_TYPE
              "
              class="row q-gutter-x-md text-h6"
              :key="item.id"
            >
              <span v-if="showTimeStamp">{{ item.time }}</span>
              <span>[{{ item.type }}]</span>
              <span>{{ item.text }}</span>
            </span>
            <span
              v-if="
                showMachineStatus &&
                item.type === Constants.MACHINE_STATUS_DATA_TYPE
              "
              class="row q-gutter-x-md text-h6"
              :key="item.id"
            >
              <span v-if="showTimeStamp">{{ item.time }}</span>
              <span>[{{ item.type }}]</span>
              <span>{{ item.text }}</span>
            </span>
            <span
              v-if="
                showFileManager &&
                item.type === Constants.JOBS_MANAGER_DATA_TYPE
              "
              class="row q-gutter-x-md text-h6"
              :key="item.id"
            >
              <span v-if="showTimeStamp">{{ item.time }}</span>
              <span>[{{ item.type }}]</span>
              <span>{{ item.text }}</span>
            </span>
          </template>
        </q-virtual-scroll>
      </q-card-section>
      <q-card-section class="fixed-bottom bg-grey-10">
        <serial-command-input />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import SerialCommandInput from 'src/components/ConsoleTabComponent/components/SerialCommandInput.vue';
import { Constants } from 'src/constants';
import { storeToRefs } from 'pinia';
import { QVirtualScroll } from 'quasar';
import { useDebuggerDialogStore } from 'src/stores/debugger-dialog';
import { watch, ref } from 'vue';

const store = useDebuggerDialogStore();

const {
  isDialogShown,
  logs,
  showSerialCommands,
  showConnectionMessages,
  showFileExecution,
  showFileManager,
  showMachineStatus,
  showTimeStamp,
} = storeToRefs(store);

const scrollAreaRef = ref<QVirtualScroll | null>(null);
const autoScroll = ref(true);

const clearScrollArea = () => store.clearDebuggerLogs();

const handlePointerScroll = () => {
  autoScroll.value = false;
};

const onScroll = () => {
  if (scrollAreaRef.value && autoScroll.value) {
    // User is at the bottom, enable auto-scrolling
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  if (scrollAreaRef.value) {
    autoScroll.value = true;
    scrollAreaRef.value.scrollTo(logs.value.length);
  }
};

const resetToggles = () => {
  showSerialCommands.value = true;
  showConnectionMessages.value = true;
  showFileExecution.value = true;
  showFileManager.value = true;
  showMachineStatus.value = true;
  showTimeStamp.value = true;
};

// when the scroll update its dom scroll to the end
watch(isDialogShown, () => {
  scrollToBottom();
});
</script>
<style scoped>
.scroll-area {
  width: 100%;
  padding: 10vh 0;
}
</style>
