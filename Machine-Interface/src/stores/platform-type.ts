import { defineStore } from 'pinia';
import { Platform } from 'quasar';

export const usePlatformTypeStore = defineStore('platform', {
  state: () => ({
    platformDetails: Platform.is,
  }),
  getters: {
    isMobile: (state) => !state.platformDetails.desktop,
    getPlatform: (state) => state.platformDetails.platform,
  },
});
