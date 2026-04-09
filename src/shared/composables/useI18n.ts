import { computed, reactive, watch, type ComputedRef, type WatchStopHandle } from 'vue'

import { translations, type Locale, type TranslationDictionary } from '@shared/i18n/translations'
import type { SessionState } from '@shared/types'

const STORAGE_KEY = 'orionixtrack.locale'

const getInitialLocale = (): Locale => {
  if (typeof window === 'undefined') {
    return 'uk'
  }

  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored === 'uk' || stored === 'en') {
    return stored
  }

  return navigator.language.toLowerCase().startsWith('uk') ? 'uk' : 'en'
}

const createI18nStore = () => {
  const state = reactive<{
    locale: Locale
  }>({
    locale: getInitialLocale(),
  })

  let sessionWatcherStop: WatchStopHandle | null = null

  const persistLocale = (): void => {
    localStorage.setItem(STORAGE_KEY, state.locale)
  }

  const setLocale = (locale: Locale): void => {
    state.locale = locale
    persistLocale()
  }

  const restoreLocale = (): void => {
    state.locale = getInitialLocale()
  }

  const syncLocaleWithSession = (session: Readonly<SessionState>): void => {
    sessionWatcherStop?.()
    sessionWatcherStop = watch(
      () => session.user?.language,
      (language) => {
        if (language === 'uk' || language === 'en') {
          setLocale(language)
        }
      },
      { immediate: true },
    )
  }

  return {
    locale: computed(() => state.locale),
    messages: computed(() => translations[state.locale]),
    setLocale,
    restoreLocale,
    syncLocaleWithSession,
  }
}

const i18nStore = createI18nStore()

export const useI18n = (): {
  locale: ComputedRef<Locale>
  messages: ComputedRef<TranslationDictionary>
  setLocale: (locale: Locale) => void
  restoreLocale: () => void
  syncLocaleWithSession: (session: Readonly<SessionState>) => void
} => i18nStore
