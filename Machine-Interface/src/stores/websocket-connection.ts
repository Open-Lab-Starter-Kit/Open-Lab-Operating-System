import { defineStore } from 'pinia';
import { handleJoystickData } from 'src/services/joystick.movement.service';
import { Constants } from '../constants';
import { useConsoleOutputStore } from './console-output';
import { useDebuggerDialogStore } from './debugger-dialog';
import { useJobsFilesManagementStore } from './jobs-files-management';
import { useGcodePreviewStore } from './gcode-preview';
import { useJobInfoStore } from './job-info';
import { useMachineStatusStore } from './machine-status';
import { useMessageOutputStore } from './message-output';
import { useUSBMonitorStore } from './usb-monitor';

export const useWebSocketStore = defineStore('websocket', {
  state: () => ({
    connection: null as WebSocket | null,
    machineStatusStore: useMachineStatusStore(),
    consoleOutputStore: useConsoleOutputStore(),
    jobInfoStore: useJobInfoStore(),
    messagesOutputStore: useMessageOutputStore(),
    jobManagerStore: useJobsFilesManagementStore(),
    debuggerStore: useDebuggerDialogStore(),
    gcodePreviewStore: useGcodePreviewStore(),
    usbMonitorStore: useUSBMonitorStore(),
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
        this.messagesOutputStore.updateMessageBasedOnStatus(
          Constants.DISCONNECTED
        );
        console.error('WebSocket error:', error);
      };

      this.connection.onmessage = async (event: MessageEvent) => {
        const res = JSON.parse(event.data);
        if (res.type === Constants.MACHINE_STATUS_DATA_TYPE) {
          this.machineStatusStore.updateStatus(res);
          this.messagesOutputStore.updateMessageBasedOnStatus(res.state);
        } else if (res.type === Constants.MACHINE_CONNECTION_DATA_TYPE) {
          this.machineStatusStore.updateConnectionStatus(res);
          if (res.success) {
            this.messagesOutputStore.updateMessageBasedOnStatus(
              Constants.CONNECTING
            );
          } else {
            this.messagesOutputStore.updateMessageBasedOnStatus(
              Constants.DISCONNECTED
            );
          }
        } else if (res.type === Constants.JOB_EXECUTION_DATA_TYPE) {
          this.jobInfoStore.updateJobProgress(res.line_index, res.total_lines);
          this.jobInfoStore.updateJobTimer(res.file_timer);
          this.consoleOutputStore.addText(res);
          await this.gcodePreviewStore.drawExecutedGcodeLine();
        } else if (res.type === Constants.SERIAL_COMMAND_DATA_TYPE) {
          this.consoleOutputStore.addText(res);
          this.messagesOutputStore.checkReceivedMessage(res.text);
        } else if (res.type === Constants.NORMAL_COMMAND_DATA_TYPE) {
          this.consoleOutputStore.addText(res);
        } else if (res.type === Constants.JOBS_MANAGER_DATA_TYPE) {
          this.jobManagerStore.updateFileManagerStatus(res);
        } else if (res.type === Constants.CAMERAS_SYSTEM_DATA_TYPE) {
          this.gcodePreviewStore.setCameraFrame(res);
        } else if (res.type === Constants.JOYSTICK_STATUS_DATA_TYPE) {
          handleJoystickData(res);
        } else if (res.type === Constants.USB_STORAGE_MONITOR_DATA_TYPE) {
          this.usbMonitorStore.updateUSBMonitorStatus(res);
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
