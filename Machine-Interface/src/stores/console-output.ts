import { defineStore } from 'pinia';
import { Constants } from 'src/constants';
import { useDebuggerDialogStore } from './debugger-dialog';

interface ConsoleTextData {
  type: string;
  text: string;
  time: string;
}

export const useConsoleOutputStore = defineStore('consoleOutput', {
  state: () => ({
    debuggerStore: useDebuggerDialogStore(),
    showExecutionTime: true as boolean,
    consoleTextList: [] as ConsoleTextData[],
  }),
  actions: {
    addText(command: ConsoleTextData) {
      // remove first item of the array to reduce memory consumption
      if (this.consoleTextList.length > 1000) {
        this.consoleTextList.shift();
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
