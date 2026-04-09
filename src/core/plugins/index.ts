import type { App } from 'vue'

import { router } from '@/router'

export const registerCorePlugins = (app: App): void => {
  app.use(router)
}
