import { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/HomeLayout.vue'),
    children: [
      {
        path: 'jobs',
        name: 'jobs',
        component: () => import('pages/JobsFilesManager.vue'),
      },
      {
        path: 'controls',
        name: 'controls',
        component: () => import('pages/MachineControls.vue'),
      },
      {
        path: 'console',
        name: 'console',
        component: () => import('pages/MachineConsole.vue'),
      },
      {
        path: 'preview',
        name: 'preview',
        component: () => import('pages/GcodePreview.vue'),
      },
      {
        path: 'generator',
        name: 'generator',
        component: () => import('pages/GcodeGenerator.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
