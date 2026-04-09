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
    path: '/auth/accept-invitation',
    name: 'accept-invitation',
    component: () => import('@/views/AuthView.vue'),
    alias: ['/accept-invitation'],
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
      roles: ['owner', 'dispatcher', 'driver'],
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
    path: '/owner/invitations',
    name: 'owner-invitations',
    component: () => import('@/views/InvitationsView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['owner'],
    },
  },
  {
    path: '/owner/employees',
    name: 'owner-employees',
    component: () => import('@/views/EmployeesView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['owner'],
    },
  },
  {
    path: '/owner/vehicles',
    name: 'owner-vehicles',
    component: () => import('@/views/VehiclesView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['owner'],
    },
  },
  {
    path: '/owner/trackers',
    name: 'owner-trackers',
    component: () => import('@/views/TrackersView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['owner'],
    },
  },
  {
    path: '/owner/channels',
    name: 'owner-channels',
    component: () => import('@/views/ChannelsView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['owner'],
    },
  },
  {
    path: '/owner/trips',
    name: 'owner-trips',
    component: () => import('@/views/TripsView.vue'),
    meta: {
      requiresAuth: true,
      roles: ['owner'],
    },
  },
  {
    path: '/owner/trips/:tripId',
    name: 'owner-trip-details',
    component: () => import('@/views/TripsView.vue'),
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
