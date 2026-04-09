import { readonly, ref } from 'vue'

type SnackbarTone = 'success' | 'info' | 'error'

interface SnackbarState {
  message: string
  tone: SnackbarTone
  visible: boolean
}

const defaultDurationMs = 3200

const state = ref<SnackbarState>({
  message: '',
  tone: 'success',
  visible: false,
})

let hideTimerId: number | null = null

const clearHideTimer = (): void => {
  if (hideTimerId !== null) {
    window.clearTimeout(hideTimerId)
    hideTimerId = null
  }
}

const hideSnackbar = (): void => {
  clearHideTimer()
  state.value = {
    ...state.value,
    visible: false,
  }
}

const showSnackbar = (
  message: string,
  options: {
    durationMs?: number
    tone?: SnackbarTone
  } = {},
): void => {
  clearHideTimer()

  state.value = {
    message,
    tone: options.tone ?? 'success',
    visible: true,
  }

  hideTimerId = window.setTimeout(() => {
    hideSnackbar()
  }, options.durationMs ?? defaultDurationMs)
}

export const useSnackbar = () => ({
  hideSnackbar,
  showSnackbar,
  snackbarState: readonly(state),
})
