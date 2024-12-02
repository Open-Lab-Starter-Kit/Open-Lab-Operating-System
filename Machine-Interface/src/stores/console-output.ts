import { defineStore } from 'pinia';
import { Constants } from 'src/constants';
import { ConsoleTextData } from 'src/interfaces/consoleOutput.interface';
import { showNotifyMessage } from 'src/services/notify.messages.service';
import { useDebuggerDialogStore } from './debugger-dialog';

export const useConsoleOutputStore = defineStore('consoleOutput', {
  state: () => ({
    debuggerStore: useDebuggerDialogStore(),
    showExecutionTime: false as boolean,
    consoleTextList: [] as ConsoleTextData[],
    currentIndex: 0,
  }),
  actions: {
    addText(command: ConsoleTextData) {
      if (command.text === Constants.SOFT_LIMITS_TRIGGER) {
        showNotifyMessage().error('The command is outside of the machine bed.');
      }
      // remove first item of the array to reduce memory consumption
      if (this.consoleTextList.length > 500) {
        this.consoleTextList.splice(0, 1);
      }
      this.consoleTextList.push(command);
      this.debuggerStore.addLog(
        new Date(),
        command.type,
        Constants.GCODE_COMMAND,
        command.text
      );
    },
    clearExecutedCommandsList() {
      this.consoleTextList = [];
    },
    removeFirstItem() {
      this.consoleTextList.shift();
    },
  },
});
