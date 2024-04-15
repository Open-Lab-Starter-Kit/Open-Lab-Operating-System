<template>
  <q-dialog
    v-model="isDialogShown"
    persistent
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="column bg-grey-9 text-white">
      <q-bar class="bg-grey-10">
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

      <q-card-section class="row justify-evenly bg-grey-10">
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
      </q-card-section>
      <q-card-section class="col">
        <q-virtual-scroll
          :items="logs"
          :item-size="50"
          ref="scrollAreaRef"
          :bar-style="{ borderRadius: '5px', background: 'brown' }"
          class="scroll-area full-height q-mb-lg"
          @virtual-scroll="onVirtualScroll"
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
                item.type === Constants.FILE_EXECUTION_DATA_TYPE
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
                item.type === Constants.FILE_MANAGER_DATA_TYPE
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
      <q-card-section><serial-command-input /></q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import SerialCommandInput from './ConsoleTabComponent/components/SerialCommandInput.vue';
import { Constants } from 'src/constants';
import { storeToRefs } from 'pinia';
import { QVirtualScroll } from 'quasar';
import { useDebuggerDialogStore } from 'src/stores/debugger-dialog';
import { onUpdated, ref, watch } from 'vue';

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
const autoScrollEnabled = ref(true);

// when the scroll update its dom scroll to the end
onUpdated(() => {
  if (scrollAreaRef.value) {
    scrollAreaRef.value.scrollTo(logs.value.length);
  }
});

const clearScrollArea = () => store.clearDebuggerLogs();
const resetToggles = () => {
  showSerialCommands.value = true;
  showConnectionMessages.value = true;
  showFileExecution.value = true;
  showFileManager.value = true;
  showMachineStatus.value = true;
  showTimeStamp.value = true;
};

const onVirtualScroll = ({ index }: { index: number }) => {
  // If the user is at the bottom of the scroll area
  if (index < logs.value.length - 10) {
    // User is not at the bottom, disable auto-scrolling
    autoScrollEnabled.value = false;
  } else {
    // User is at the bottom, enable auto-scrolling
    autoScrollEnabled.value = true;
  }
};

watch(logs, () => {
  // If auto-scrolling is enabled, scroll to the bottom
  if (autoScrollEnabled.value && scrollAreaRef.value) {
    scrollAreaRef.value.scrollTo(newConsoleTextList.length);
  }
});
</script>
