import { ref } from 'vue'

export const useApiState = <TError = string>(initialError: TError) => {
  const isLoading = ref(false)
  const error = ref<TError>(initialError)

  const resetError = (): void => {
    error.value = initialError
  }

  const execute = async <TResult>(
    operation: () => Promise<TResult>,
    mapError: (error: unknown) => TError,
  ): Promise<TResult> => {
    isLoading.value = true
    resetError()

    try {
      return await operation()
    } catch (errorValue) {
      error.value = mapError(errorValue)
      throw errorValue
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    resetError,
    execute,
  }
}
