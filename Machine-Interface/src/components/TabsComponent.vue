<template>
  <q-list class="column fit full-width justify-center">
    <template v-for="(navItem, index) in navList" :key="index">
      <q-item
        clickable
        :active="isActive(navItem)"
        @click="onClick(navItem)"
        class="col-grow q-pa-sm"
        active-class="active-tab"
      >
        <q-item-section class="column flex-center">
          <!-- Conditionally show the notification circle -->
          <q-icon
            v-if="navItem.label === 'Console' && hasNotification"
            name="lens"
            color="red"
            class="q-ml-xl"
          ></q-icon>
          <q-icon :name="navItem.icon" size="lg" />
          <p>{{ navItem.label }}</p>
        </q-item-section>
      </q-item>
    </template>
  </q-list>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { NavItem, NavItems } from './models';
import { storeToRefs } from 'pinia';
import { useMessageOutputStore } from 'src/stores/message-output';

const store = useMessageOutputStore();
const { isError } = storeToRefs(store);

const hasNotification = ref(false);

// watch for changes in the isError flag
watch(
  () => isError.value,
  (newIsError) => {
    if (newIsError) hasNotification.value = true;
    else hasNotification.value = false;
  }
);

const navList: NavItems = {
  files: {
    icon: 'folder',
    label: 'File Manager',
    router: 'files',
  },
  controls: {
    icon: 'tune',
    label: 'Controls',
    router: 'controls',
  },
  console: {
    icon: 'code',
    label: 'Console',
    router: 'console',
  },
};

const router = useRouter();

// Reactive variable to track the active menu item
const activeMenuItem = ref(navList.controls);

// check the active item and navigate to it at first mount
const isActive = (item: NavItem): boolean => {
  if (activeMenuItem.value.label === item.label) {
    router.push({ name: item.router });
    return true;
  }
  return false;
};

const onClick = (item: NavItem): void => {
  activeMenuItem.value = item;

  removeNotification(item.label);
  // navigate to the right page
  router.push({ name: item.router });
};

const removeNotification = (tabName: string) => {
  // just the console tab has notification
  if (tabName === 'Console' && hasNotification.value) {
    hasNotification.value = false;
  }
};
</script>

<style scoped>
.active-tab {
  background-color: white;
  color: black;
}
</style>
