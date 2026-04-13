import { ApiError, getSafeErrorMessage, isApiError } from './errors'

interface ErrorMappingRule<TValue> {
  matches: (error: ApiError) => boolean
  value: TValue
}

export const createStatusRule = <TValue>(
  status: number,
  value: TValue,
  predicate?: (error: ApiError) => boolean,
): ErrorMappingRule<TValue> => ({
  matches: (error) => error.status === status && (predicate ? predicate(error) : true),
  value,
})

export const hasApiErrorMessage = (
  error: ApiError,
  patterns: RegExp[],
): boolean => patterns.some((pattern) => pattern.test(error.message))

export const mapApiError = <TValue>(
  error: unknown,
  fallback: TValue,
  rules: ErrorMappingRule<TValue>[],
): TValue => {
  if (isApiError(error)) {
    const matchedRule = rules.find((rule) => rule.matches(error))

    if (matchedRule) {
      return matchedRule.value
    }
  }

  return fallback
}

export const mapApiErrorMessage = (
  error: unknown,
  fallback: string,
  rules: ErrorMappingRule<string>[],
): string => mapApiError(error, getSafeErrorMessage(error, fallback), rules)
