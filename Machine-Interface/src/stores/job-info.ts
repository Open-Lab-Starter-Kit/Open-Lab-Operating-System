import { defineStore } from 'pinia';

export const useJobInfoStore = defineStore('jobInfo', {
  state: () => ({
    isJobEnded: false as boolean,
    jobTimer: 0 as number,
    jobProgress: 0 as number,
  }),

  actions: {
    updateJobTimer(file_timer: number) {
      this.jobTimer = file_timer;
    },
    updateJobProgress(line_index: number, total_lines: number) {
      this.jobProgress = line_index / total_lines;
      // job finished
      if (this.jobProgress === 1) {
        this.isJobEnded = true;
      }
    },
    restJobProgress() {
      this.jobProgress = 0;
      this.isJobEnded = false;
    },
  },
});
