import { defineStore } from 'pinia';

export const useJobInfoStore = defineStore('jobInfo', {
  state: () => ({
    jobTimer: 0 as number,
    jobProgress: 0 as number,
  }),

  actions: {
    updateJobTimer(file_timer: number) {
      this.jobTimer = file_timer;
    },
    updateJobProgress(line_index: number, total_lines: number) {
      this.jobProgress = line_index / total_lines;
    },
    restJobProgress() {
      this.jobProgress = 0;
    },
  },
});
