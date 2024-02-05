import { defineStore } from 'pinia';
import { Constants } from '../constants';
import { useConsoleOutputStore } from './console-output';
import { useJobInfoStore } from './job-info';
import { useMachineStatusStore } from './machine-status';
import { useMessageOutputStore } from './message-output';

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    connection: null as WebSocket | null,
  }),

  actions: {
    connect(url: string) {
      this.connection = new WebSocket(url);

      this.connection.onopen = () => {
        console.log('WebSocket connection opened.');
      };

      this.connection.onclose = () => {
        console.log('WebSocket connection closed.');
      };

      this.connection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.connection.onmessage = (event: MessageEvent) => {
        const machineStatusStore = useMachineStatusStore();
        const consoleOutputStore = useConsoleOutputStore();
        const jobInfoStore = useJobInfoStore();
        const messagesOutputStore = useMessageOutputStore();

        const res = JSON.parse(event.data);
        if (res.type === Constants.MACHINE_STATUS_DATA_TYPE) {
          machineStatusStore.updateStatus(res);
          messagesOutputStore.updateMessageBasedOnStatus(res.state);
        } else if (res.type === Constants.FILE_DATA_TYPE) {
          jobInfoStore.updateJobProgress(res.line_index, res.total_lines);
          consoleOutputStore.addText(res);
        } else if (res.type === Constants.SERIAL_COMMAND_DATA_TYPE) {
          consoleOutputStore.addText(res);
          messagesOutputStore.checkReceivedMessage(res.text);
        } else if (res.type === Constants.NORMAL_COMMAND_DATA_TYPE) {
          consoleOutputStore.addText(res);
        } else if (res.type === Constants.MACHINE_CONNECTION_DATA_TYPE) {
          machineStatusStore.updateConnectionStatus(res);
          messagesOutputStore.updateMessageBasedOnStatus(
            Constants.DISCONNECTED
          );
        }
      };
    },

    send(data: unknown) {
      if (this.connection && this.connection.readyState === WebSocket.OPEN) {
        this.connection.send(JSON.stringify(data));
      }
    },
  },
});
