import { defineStore } from 'pinia';

interface JobTimerState {
  totalTimeInSeconds: number;
  intervalId: NodeJS.Timeout | null;
  isPaused: boolean;
}

export const useJobInfoStore = defineStore('jobInfo', {
  state: () => ({
    jobTimer: {
      totalTimeInSeconds: 0,
      intervalId: null,
      isPaused: false,
    } as JobTimerState,
    jobProgress: 0,
  }),

  getters: {
    isJobPaused: (state) => state.jobTimer.isPaused,
  },
  actions: {
    startJobTimer() {
      // rest the timer before starting
      this.resetJobTimer();
      // Create the interval and store its ID
      this.jobTimer.intervalId = setInterval(() => {
        this.jobTimer.totalTimeInSeconds++;
      }, 1000) as NodeJS.Timeout;
    },

    stopJobTimer() {
      // Clear the interval using its ID
      if (this.jobTimer.intervalId) {
        clearInterval(this.jobTimer.intervalId);
        this.jobTimer.intervalId = null;
        this.jobTimer.isPaused = false;
      }
    },
    pauseJobTimer() {
      // Clear the interval without resetting the ID
      if (this.jobTimer.intervalId) {
        clearInterval(this.jobTimer.intervalId);
        this.jobTimer.intervalId = null;
        this.jobTimer.isPaused = true;
      }
    },

    resumeJobTimer() {
      // If the timer is paused, create a new interval
      if (this.jobTimer.isPaused) {
        this.jobTimer.intervalId = setInterval(() => {
          this.jobTimer.totalTimeInSeconds++;
        }, 1000) as NodeJS.Timeout;
        this.jobTimer.isPaused = false;
      }
    },

    resetJobTimer() {
      // Reset the timer's value
      this.jobTimer.totalTimeInSeconds = 0;

      // If the timer is running, stop it
      if (this.jobTimer.intervalId !== null) {
        clearInterval(this.jobTimer.intervalId);
        this.jobTimer.intervalId = null;
        this.jobTimer.isPaused = false;
      }
    },
    updateJobProgress(line_index: number, total_lines: number) {
      this.jobProgress = line_index / total_lines;
      // file finished execution
      if (this.jobProgress === 1) {
        this.stopJobTimer();
      }
    },
    restJobProgress() {
      this.jobProgress = 0;
    },
  },
});
