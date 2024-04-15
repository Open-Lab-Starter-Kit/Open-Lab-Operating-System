import { defineStore } from 'pinia';
import { Dialog } from 'quasar';
import { Constants } from 'src/constants';
import { useDebuggerDialogStore } from './debugger-dialog';

export const useMessageOutputStore = defineStore('messagesOutput', {
  state: () => ({
    state: Constants.DISCONNECTED as string,
    debuggerStore: useDebuggerDialogStore(),
    smallMessage: Constants.SMALL_MESSAGES.DISCONNECTED_MESSAGE as string,
    messageTitle: Constants.DISCONNECTED as string,
    messageBody: Constants.LONG_MESSAGES.DISCONNECTED_MESSAGE as string,
    alarmCode: 0 as number,
    errorCode: 0 as number,
    isError: false as boolean,
    isAlertDialogShown: false as boolean,
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
      this.isAlertDialogShown = false;
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
        !this.isAlertDialogShown &&
          this.showAlertDialog(Constants.ERROR, this.errorCode);

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
        !this.isAlertDialogShown &&
          this.showAlertDialog(Constants.DISCONNECTED);
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
      } else if (this.state === Constants.RUN) {
        this.messageTitle = Constants.RUN;
        this.smallMessage = Constants.SMALL_MESSAGES.RUN_MESSAGE;
        this.messageBody = Constants.LONG_MESSAGES.RUN_MESSAGE;
      } else if (this.state === Constants.ALARM) {
        const code = this.alarmCode;
        this.messageTitle = Constants.ALARM + ' ' + code;
        !this.isAlertDialogShown &&
          this.showAlertDialog(Constants.ALARM, this.alarmCode);
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
    showAlertDialog(type: string, code = 0) {
      // use debugger dialog store
      const store = useDebuggerDialogStore();

      this.isAlertDialogShown = true;
      if (type === Constants.ERROR) {
        Dialog.create({
          title: type + ' ' + code,
          message: Constants.LONG_MESSAGES.ERROR_MESSAGES[code],
          persistent: true,
          noEscDismiss: true,
          color: 'primary',
          ok: {
            label: 'Open Debugger',
            flat: true,
          },
          cancel: {
            label: 'OK',
            flat: true,
          },
        })
          .onOk(() => {
            store.showDebuggerDialog();
            this.isAlertDialogShown = false;
          })
          .onCancel(() => {
            this.isAlertDialogShown = false;
          });
      } else if (type === Constants.ALARM) {
        Dialog.create({
          title: type + ' ' + code,
          message: Constants.LONG_MESSAGES.ALARM_MESSAGES[code],
          persistent: true,
          color: 'primary',
          noEscDismiss: true,
          ok: {
            label: 'Open Debugger',
            flat: true,
          },
          cancel: {
            label: 'OK',
            flat: true,
          },
        })
          .onOk(() => {
            store.showDebuggerDialog();
          })
          .onCancel(() => {
            this.isAlertDialogShown = false;
          });
      } else if (type === Constants.DISCONNECTED) {
        Dialog.create({
          title: type,
          message: Constants.LONG_MESSAGES.DISCONNECTED_MESSAGE,
          persistent: true,
          noEscDismiss: true,
          ok: {
            label: 'Retry',
            flat: true,
          },
        }).onOk(() => {
          if (this.state !== Constants.DISCONNECTED) {
            this.isAlertDialogShown = false;
          } else {
            this.isAlertDialogShown = true;
            this.showAlertDialog(type);
          }
        });
      }
    },
  },
});
