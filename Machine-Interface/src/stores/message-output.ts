import { defineStore } from 'pinia';
import { Constants } from 'src/constants';
import { createDialogComponent } from 'src/services/dialog.messages.service';
import { useDebuggerDialogStore } from './debugger-dialog';

export const useMessageOutputStore = defineStore('messagesOutput', {
  state: () => ({
    state: Constants.CONNECTING as string,
    debuggerStore: useDebuggerDialogStore(),
    smallMessage: Constants.SMALL_MESSAGES.CONNECTING_MESSAGE as string,
    messageTitle: Constants.CONNECTING as string,
    messageBody: Constants.LONG_MESSAGES.CONNECTING_MESSAGE as
      | string
      | string[],
    alarmCode: 0 as number,
    errorCode: 0 as number,
    isError: false as boolean,
    isAlarmDialogShown: false as boolean,
    isDisconnectDialogShown: false as boolean,
  }),
  actions: {
    checkReceivedMessage(text: string) {
      // Extract alarm and error codes from the status report
      const alarmMatches = text.match(/ALARM:(\d+)/);
      if (alarmMatches) {
        this.alarmCode = parseInt(alarmMatches[1]);
      }

      const errorMatches = text.match(/error:(\d+)/);
      if (errorMatches) {
        this.errorCode = parseInt(errorMatches[1]);
        this.isError = true;
      }
    },
    updateMessageBasedOnStatus(state: string) {
      if (state !== this.state) {
        this.state = state;
        this.checkMachineState();
      }
      this.checkForErrors();
      this.checkMachineConnection();
    },
    checkForErrors() {
      // interface received an error message
      if (this.isError) {
        const code = this.errorCode;
        this.messageTitle = Constants.ERROR + ' ' + code;
        // show dialog
        this.showDialog(Constants.ERROR, this.errorCode);

        // add to debugger
        this.debuggerStore.addLog(
          new Date(),
          Constants.MACHINE_STATUS_DATA_TYPE,
          Constants.ERROR,
          Constants.LONG_MESSAGES.ERROR_MESSAGES[this.errorCode]
        );
        this.isError = false;
      }
    },
    checkMachineConnection() {
      if (this.state === Constants.DISCONNECTED) {
        this.messageTitle = Constants.DISCONNECTED;
        this.smallMessage = Constants.SMALL_MESSAGES.DISCONNECTED_MESSAGE;
        this.messageBody = Constants.LONG_MESSAGES.DISCONNECTED_MESSAGE;

        // if the machine still disconnected
        !this.isDisconnectDialogShown &&
          this.showDialog(Constants.DISCONNECTED);
      } else if (this.state === Constants.CONNECTING) {
        this.messageTitle = Constants.CONNECTING;
        this.smallMessage = Constants.SMALL_MESSAGES.CONNECTING_MESSAGE;
        this.messageBody = Constants.LONG_MESSAGES.CONNECTING_MESSAGE;
      }
    },
    checkMachineState() {
      if (this.state === Constants.HOLD) {
        this.messageTitle = Constants.HOLD;
        this.smallMessage = Constants.SMALL_MESSAGES.HOLD_MESSAGE;
        this.messageBody = Constants.LONG_MESSAGES.HOLD_MESSAGE;
      } else if (this.state === Constants.IDLE) {
        this.messageTitle = Constants.IDLE;
        this.smallMessage = Constants.SMALL_MESSAGES.IDLE_MESSAGE;
        this.messageBody = Constants.LONG_MESSAGES.IDLE_MESSAGE;
      } else if (this.state === Constants.DOOR) {
        this.messageTitle = Constants.DOOR;
        this.smallMessage = Constants.SMALL_MESSAGES.DOOR_MESSAGE;
        this.messageBody = Constants.LONG_MESSAGES.DOOR_MESSAGE;
      } else if (this.state === Constants.HOMING) {
        this.messageTitle = Constants.HOMING;
        this.smallMessage = Constants.SMALL_MESSAGES.HOMING_MESSAGE;
        this.messageBody = Constants.LONG_MESSAGES.HOMING_MESSAGE;
      } else if (this.state === Constants.RUN) {
        this.messageTitle = Constants.RUN;
        this.smallMessage = Constants.SMALL_MESSAGES.RUN_MESSAGE;
        this.messageBody = Constants.LONG_MESSAGES.RUN_MESSAGE;
      } else if (this.state === Constants.ALARM) {
        const code = this.alarmCode;
        this.messageTitle = Constants.ALARM + ' ' + code;
        !this.isAlarmDialogShown &&
          this.showDialog(Constants.ALARM, this.alarmCode);
        this.smallMessage = Constants.SMALL_MESSAGES.ALARM_MESSAGE;
        this.messageBody =
          Constants.LONG_MESSAGES.ALARM_MESSAGES[this.alarmCode];
      }
      // add state to debugger logs
      this.debuggerStore.addLog(
        new Date(),
        Constants.MACHINE_STATUS_DATA_TYPE,
        this.messageTitle,
        this.messageBody
      );
    },
    showDialog(type: string, code = 0) {
      if (type === Constants.ERROR) {
        createDialogComponent(type, 'Open Debugger', 'OK', code).onOk(() => {
          this.debuggerStore.showDebuggerDialog();
        });
      } else if (type === Constants.ALARM) {
        this.isAlarmDialogShown = true;
        createDialogComponent(type, 'Open Debugger', 'OK', code)
          .onOk(() => {
            this.debuggerStore.showDebuggerDialog();
          })
          .onCancel(() => {
            this.isAlarmDialogShown = false;
          });
      } else if (type === Constants.DISCONNECTED) {
        this.isDisconnectDialogShown = true;
        createDialogComponent(type, 'Retry').onOk(() => {
          location.reload();
        });
      }
    },
  },
});
