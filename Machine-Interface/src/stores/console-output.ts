import { defineStore } from 'pinia';

interface ConsoleTextData {
  type: string;
  text: string;
  time: string;
}

export const useConsoleOutputStore = defineStore('consoleOutput', {
  state: () => ({
    consoleTextList: [] as ConsoleTextData[],
  }),
  actions: {
    addText(command: ConsoleTextData) {
      this.consoleTextList.push(command);
    },
    clearExecutedCommandsList() {
      this.consoleTextList = [];
    },
  },
});
