import { defineStore } from 'pinia';
import { Constants } from '../constants';
import { useConsoleOutputStore } from './console-output';
import { useDebuggerDialogStore } from './debugger-dialog';
import { useFileManagementStore } from './file-management';
import { useGcodePreview } from './gcode-preview';
import { useJobInfoStore } from './job-info';
import { useMachineStatusStore } from './machine-status';
import { useMessageOutputStore } from './message-output';

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    connection: null as WebSocket | null,
    machineStatusStore: useMachineStatusStore(),
    consoleOutputStore: useConsoleOutputStore(),
    jobInfoStore: useJobInfoStore(),
    messagesOutputStore: useMessageOutputStore(),
    fileManagerStore: useFileManagementStore(),
    debuggerStore: useDebuggerDialogStore(),
    gcodePreviewStore: useGcodePreview(),
  }),

  actions: {
    connect(url: string) {
      this.connection = new WebSocket(url);

      this.connection.onopen = () => {
        console.log('WebSocket connection opened.');
        this.debuggerStore.addLog(
          new Date(),
          Constants.CONNECTION_DATA_TYPE,
          'Websocket',
          'webSocket connection opened.'
        );
      };

      this.connection.onclose = () => {
        console.log('WebSocket connection closed. Retry to connect...');

        this.debuggerStore.addLog(
          new Date(),
          Constants.CONNECTION_DATA_TYPE,
          'Websocket',
          `websocket can not connect to server with the url: ${url}. Retry to connect...`
        );
        // Retry connecting after 1 second
        setTimeout(() => {
          this.connect(url);
        }, 1000);
      };

      this.connection.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.messagesOutputStore.updateMessageBasedOnStatus(
          Constants.DISCONNECTED
        );
      };

      this.connection.onmessage = (event: MessageEvent) => {
        const res = JSON.parse(event.data);
        if (res.type === Constants.MACHINE_STATUS_DATA_TYPE) {
          this.machineStatusStore.updateStatus(res);
          this.messagesOutputStore.updateMessageBasedOnStatus(res.state);
        } else if (res.type === Constants.FILE_EXECUTION_DATA_TYPE) {
          this.jobInfoStore.updateJobProgress(res.line_index, res.total_lines);
          this.jobInfoStore.updateJobTimer(res.file_timer);
          this.consoleOutputStore.addText(res);
        } else if (res.type === Constants.SERIAL_COMMAND_DATA_TYPE) {
          this.consoleOutputStore.addText(res);
          this.messagesOutputStore.checkReceivedMessage(res.text);
        } else if (res.type === Constants.NORMAL_COMMAND_DATA_TYPE) {
          this.consoleOutputStore.addText(res);
        } else if (res.type === Constants.MACHINE_CONNECTION_DATA_TYPE) {
          this.machineStatusStore.updateConnectionStatus(res);
          this.messagesOutputStore.updateMessageBasedOnStatus(
            Constants.DISCONNECTED
          );
        } else if (res.type === Constants.FILE_MANAGER_DATA_TYPE) {
          this.fileManagerStore.updateFileManagerStatus(res);
        } else if (res.type === Constants.CAMERAS_SYSTEM_DATA_TYPE) {
          this.gcodePreviewStore.setCameraFrame(res);
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
