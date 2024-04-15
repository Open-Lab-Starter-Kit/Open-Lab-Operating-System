import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';

export interface NavItem {
  icon: string;
  label: string;
  router: string;
}

export interface NavItems {
  files: NavItem;
  controls: NavItem;
  console: NavItem;
}

export const useTabsStore = defineStore('tabsStore', {
  state: () => ({
    navList: {
      files: {
        icon: 'folder',
        label: 'File Manager',
        router: 'files',
      } as NavItem,
      controls: {
        icon: 'tune',
        label: 'Controls',
        router: 'controls',
      } as NavItem,
      preview: {
        icon: 'preview',
        label: 'Job Preview',
        router: 'preview',
      } as NavItem,
      convertor: {
        icon: 'change_circle',
        label: 'Gcode Generator',
        router: 'generator',
      } as NavItem,
      console: {
        icon: 'code',
        label: 'Console',
        router: 'console',
      } as NavItem,
    } as NavItems,
    activeMenuItem: {
      icon: 'tune',
      label: 'Controls',
      router: 'controls',
    } as NavItem,
    router: useRouter(),
  }),

  actions: {
    // check the active item and navigate to it at first mount
    isActiveTab(item: NavItem) {
      if (this.activeMenuItem.label === item.label) {
        this.changeTab(item);
        return true;
      }
      return false;
    },

    changeTab(item: NavItem) {
      this.activeMenuItem = item;
      // navigate to the right page
      this.router.push({ name: item.router });
    },
  },
});
