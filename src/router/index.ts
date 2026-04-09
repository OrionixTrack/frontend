import { createRouter, createWebHistory } from 'vue-router'

import { applyRouteGuards } from '@/router/guards'
import { routes } from '@/router/routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(applyRouteGuards)
