import { defineStore } from 'pinia';
import { NavTab, NavTabs } from 'src/interfaces/activeTabs.interface';
import { useRouter } from 'vue-router';

export const useTabsStore = defineStore('tabsStore', {
  state: () => ({
    navList: {
      files: {
        icon: 'folder',
        label: 'Jobs Manager',
        router: 'jobs',
      } as NavTab,
      controls: {
        icon: 'tune',
        label: 'Controls',
        router: 'controls',
      } as NavTab,
      preview: {
        icon: 'preview',
        label: 'Job Preview',
        router: 'preview',
      } as NavTab,
      convertor: {
        icon: 'change_circle',
        label: 'Gcode Generator',
        router: 'generator',
      } as NavTab,
      console: {
        icon: 'code',
        label: 'Console',
        router: 'console',
      } as NavTab,
    } as NavTabs,
    activeMenuItem: {
      icon: 'tune',
      label: 'Controls',
      router: 'controls',
    } as NavTab,
    router: useRouter(),
  }),

  actions: {
    // check the active item and navigate to it at first mount
    isActiveTab(tab: NavTab) {
      if (this.activeMenuItem.label === tab.label) {
        this.changeTab(tab);
        return true;
      }
      return false;
    },

    changeTab(tab: NavTab) {
      this.activeMenuItem = tab;
      // navigate to the right page
      this.router.push({ name: tab.router });
    },
  },
});
