import { defineStore } from 'pinia';
import { Constants } from 'src/constants';

export const useMessageOutputStore = defineStore('messagesOutput', {
  state: () => ({
    state: Constants.DISCONNECTED as string,
    smallMessage: Constants.SMALL_MESSAGES.DISCONNECTED_MESSAGE as string,
    messageTitle: Constants.DISCONNECTED as string,
    messageContent: Constants.LONG_MESSAGES.DISCONNECTED_MESSAGE as string,
    alarmCode: 0 as number,
    errorCode: 0 as number,
    isError: false as boolean,
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
      this.state = state;
      if (state === Constants.HOLD) {
        this.messageTitle = Constants.HOLD;
        this.smallMessage = Constants.SMALL_MESSAGES.HOLD_MESSAGE;
        this.messageContent = Constants.LONG_MESSAGES.HOLD_MESSAGE;
      } else if (state === Constants.IDLE) {
        // interface received an error message
        if (this.isError) {
          const code = this.errorCode;
          this.messageTitle = Constants.ERROR + ' ' + code;
          this.smallMessage = Constants.SMALL_MESSAGES.ERROR_MESSAGE;
          this.messageContent = Constants.LONG_MESSAGES.ERROR_MESSAGES[code];
        } else {
          this.messageTitle = Constants.IDLE;

          this.smallMessage = Constants.SMALL_MESSAGES.IDLE_MESSAGE;
          this.messageContent = Constants.LONG_MESSAGES.IDLE_MESSAGE;
        }
      } else if (state === Constants.RUN) {
        // reset the error flag when the machine run correctly
        this.isError = false;
        this.messageTitle = Constants.RUN;

        this.smallMessage = Constants.SMALL_MESSAGES.RUN_MESSAGE;
        this.messageContent = Constants.LONG_MESSAGES.RUN_MESSAGE;
      } else if (state === Constants.ALARM) {
        const code = this.alarmCode;
        this.messageTitle = Constants.ALARM + ' ' + code;
        this.smallMessage = Constants.SMALL_MESSAGES.ALARM_MESSAGE;
        this.messageContent = Constants.LONG_MESSAGES.ALARM_MESSAGES[code];
      } else if (state === Constants.DISCONNECTED) {
        this.messageTitle = Constants.DISCONNECTED;
        this.smallMessage = Constants.SMALL_MESSAGES.DISCONNECTED_MESSAGE;
        this.messageContent = Constants.LONG_MESSAGES.DISCONNECTED_MESSAGE;
      } else if (state === Constants.CONNECTED) {
        this.messageTitle = Constants.CONNECTED;
        this.smallMessage = '-';
        this.messageContent = '-';
      }
    },
  },
});
