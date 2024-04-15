<template>
  <q-input
    outlined
    dense
    color="black"
    bg-color="white"
    v-model="command"
    placeholder="Type GRBL Command"
    lazy-rules
    @keyup.enter="onEnter"
    class="row flex-center q-my-lg"
    :disable="isConsoleDisabled()"
  >
    <template v-slot:append>
      <q-icon
        v-if="command !== ''"
        name="close"
        @click="command = ''"
        class="cursor-pointer"
      />
    </template>

    <template v-slot:after>
      <q-btn
        label="Send"
        @click="onSubmit"
        color="grey-4"
        size="1.5vh"
        no-caps
        text-color="black"
        :disable="isConsoleDisabled()"
      />
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Constants } from 'src/constants';
import { useMachineStatusStore } from 'src/stores/machine-status';
import { useWebSocketStore } from 'src/stores/websocket-connection';
import { ref } from 'vue';

const websocketStore = useWebSocketStore();
const machineStatusStore = useMachineStatusStore();
const { machineState } = storeToRefs(machineStatusStore);

const command = ref<string | null>('');
const formSubmitted = ref(false);

const onSubmit = () => {
  formSubmitted.value = true;

  if (command.value) {
    // send to server using websocket
    const req = {
      type: Constants.SERIAL_COMMAND_DATA_TYPE,
      data: {
        command: command.value,
      },
    };
    websocketStore.send(req);
    // reset the value after send
    command.value = '';
  }
};

const onEnter = () => {
  if (command.value || formSubmitted.value) {
    // Handle Enter key press (you can call the same onSubmit function)
    onSubmit();
  }
};

const isConsoleDisabled = () => {
  if (
    machineState.value === Constants.RUN ||
    machineState.value === Constants.HOLD
  )
    return true;
  else return false;
};
</script>
