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
    path: '/register',
    name: 'register',
    component: () => import('@/views/AuthView.vue'),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/check-email',
    name: 'check-email',
    component: () => import('@/views/AuthView.vue'),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/auth/verify-email',
    name: 'verify-email',
    component: () => import('@/views/AuthView.vue'),
    alias: ['/verify-email'],
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/resend-verification',
    name: 'resend-verification',
    component: () => import('@/views/AuthView.vue'),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('@/views/AuthView.vue'),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: () => import('@/views/AuthView.vue'),
    meta: {
      guestOnly: true,
    },
  },
  {
    path: '/accept-invitation',
    name: 'accept-invitation',
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
    path: '/owner/settings',
    name: 'owner-settings',
    component: () => import('@/views/OwnerSettingsView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['owner'],
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  },
]
