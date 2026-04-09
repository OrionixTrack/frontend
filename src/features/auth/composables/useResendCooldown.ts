import { onBeforeUnmount, ref } from 'vue'

export const useResendCooldown = () => {
  const resendCooldownSeconds = ref(0)
  let resendCooldownTimer: number | null = null

  const clearResendCooldown = (): void => {
    if (resendCooldownTimer !== null) {
      window.clearInterval(resendCooldownTimer)
      resendCooldownTimer = null
    }
  }

  const startResendCooldown = (seconds: number): void => {
    clearResendCooldown()
    resendCooldownSeconds.value = Math.max(0, Math.ceil(seconds))

    if (!resendCooldownSeconds.value) {
      return
    }

    resendCooldownTimer = window.setInterval(() => {
      if (resendCooldownSeconds.value <= 1) {
        resendCooldownSeconds.value = 0
        clearResendCooldown()
        return
      }

      resendCooldownSeconds.value -= 1
    }, 1000)
  }

  onBeforeUnmount(() => {
    clearResendCooldown()
  })

  return {
    resendCooldownSeconds,
    startResendCooldown,
  }
}
