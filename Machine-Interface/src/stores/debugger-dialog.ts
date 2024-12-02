import { defineStore } from 'pinia';

interface LogMessage {
  id: number;
  time: string;
  type: string;
  text: string | unknown;
}

export const useDebuggerDialogStore = defineStore('debuggerDialog', {
  state: () => ({
    isDialogShown: false as boolean,
    showSerialCommands: true as boolean,
    showConnectionMessages: true as boolean,
    showFileExecution: true as boolean,
    showFileManager: true as boolean,
    showMachineStatus: true as boolean,
    showTimeStamp: true as boolean,
    logs: [] as LogMessage[],
  }),

  actions: {
    showDebuggerDialog() {
      this.isDialogShown = true;
    },
    closeDebuggerDialog() {
      this.isDialogShown = false;
    },
    addLog(time: Date, type: string, title: string, body: string | unknown) {
      // add new item
      this.logs.push({
        id: this.logs.length,
        time: this.formatTimestamp(time),
        type,
        text: `${title}: ${body}`,
      });
    },
    formatTimestamp(time: Date) {
      // Extract individual components of the date
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      const seconds = String(time.getSeconds()).padStart(2, '0');
      const day = String(time.getDate()).padStart(2, '0');
      const month = String(time.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
      const year = time.getFullYear();

      // Create the formatted timestamp string
      const formattedTimestamp = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

      return formattedTimestamp;
    },
    downloadLogs() {
      const logsText = this.logs
        .map((log) => {
          return `${log?.time} [${log?.type}] ${log?.text}`;
        })
        .join('\n');
      const filename = 'olos_logs.txt';
      const blob = new Blob([logsText], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    clearDebuggerLogs() {
      this.logs = [];
    },
  },
});
