import type { RouteRecordRaw } from 'vue-router'

import { useSessionStore } from '@core/stores/session'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const { isAuthenticated } = useSessionStore()

      return isAuthenticated.value ? '/dashboard' : '/login'
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/AuthView.vue'),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['owner', 'dispatcher'],
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]
