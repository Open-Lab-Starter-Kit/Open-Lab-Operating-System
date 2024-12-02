import { defineStore } from 'pinia';
import { Tool } from 'src/interfaces/configSettings.interface';
import { executeNormalGCommands } from 'src/services/execute.commands.service';

export const useToolsChangerStore = defineStore('toolsChanger', {
  actions: {
    useTool(tool: Tool) {
      executeNormalGCommands(tool.command);
    },
  },
});
