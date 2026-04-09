import { computed, readonly, ref, type ComputedRef, type Ref } from 'vue'

export type AppTheme = 'dark' | 'light'

const STORAGE_KEY = 'orionixtrack.theme'

const getInitialTheme = (): AppTheme => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored === 'dark' || stored === 'light') {
    return stored
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const createThemeStore = () => {
  const theme = ref<AppTheme>(getInitialTheme())
  let isApplied = false

  const applyTheme = (value: AppTheme): void => {
    theme.value = value
    document.documentElement.dataset.theme = value
    localStorage.setItem(STORAGE_KEY, value)
    isApplied = true
  }

  const restoreTheme = (): void => {
    applyTheme(getInitialTheme())
  }

  return {
    theme: readonly(theme) as Readonly<Ref<AppTheme>>,
    isDark: computed(() => theme.value === 'dark'),
    restoreTheme,
    setTheme: applyTheme,
    toggleTheme: () => applyTheme(theme.value === 'dark' ? 'light' : 'dark'),
    ensureApplied: () => {
      if (!isApplied) {
        restoreTheme()
      }
    },
  }
}

const themeStore = createThemeStore()

export const useTheme = (): {
  theme: Readonly<Ref<AppTheme>>
  isDark: ComputedRef<boolean>
  restoreTheme: () => void
  setTheme: (value: AppTheme) => void
  toggleTheme: () => void
  ensureApplied: () => void
} => themeStore
