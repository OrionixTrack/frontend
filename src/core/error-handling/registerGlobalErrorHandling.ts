import type { App } from 'vue'

export const registerGlobalErrorHandling = (app: App): void => {
  app.config.errorHandler = (error, instance, info) => {
    window.dispatchEvent(
      new CustomEvent('app:error', {
        detail: {
          error,
          info,
        },
      }),
    )

    console.error('Global Vue error', { error, instance, info })
  }
}
