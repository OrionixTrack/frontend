import { reactive, watch, type WatchSource } from 'vue'
import type { LocationQueryRaw, RouteLocationNormalizedLoaded, Router } from 'vue-router'

interface BaseDirectoryFilters {
  limit: number
  offset: number
  search: string
}

export interface PaginatedDirectoryState<TItem, TFilters extends BaseDirectoryFilters> {
  items: TItem[]
  hasNextPage: boolean
  hasLoaded: boolean
  appliedSearch: string
  filters: TFilters
}

interface UseDirectoryRouteSyncOptions {
  route: RouteLocationNormalizedLoaded
  router: Router
  applyRouteState: () => void
  buildRouteQuery: () => LocationQueryRaw
  watchSources: WatchSource<unknown> | WatchSource<unknown>[]
}

export const createPaginatedDirectoryState = <TItem, TFilters extends BaseDirectoryFilters>(
  createFilters: () => TFilters,
): PaginatedDirectoryState<TItem, TFilters> => ({
  items: [],
  hasNextPage: true,
  hasLoaded: false,
  appliedSearch: '',
  filters: createFilters(),
})

export const createReferenceDirectoryState = <TItem>(limit: number) => ({
  items: [] as TItem[],
  hasNextPage: true,
  hasLoaded: false,
  appliedSearch: '',
  filters: {
    limit,
    offset: 0,
    search: '',
  },
})

export const applyPaginatedItems = <TItem, TFilters extends BaseDirectoryFilters>(
  state: PaginatedDirectoryState<TItem, TFilters>,
  items: TItem[],
): void => {
  state.items = state.filters.offset === 0 ? items : [...state.items, ...items]
  state.hasNextPage = items.length === state.filters.limit
  state.hasLoaded = true
}

export const applyUniquePaginatedItems = <
  TItem extends { id: number },
  TFilters extends BaseDirectoryFilters,
>(
  state: PaginatedDirectoryState<TItem, TFilters>,
  items: TItem[],
): void => {
  state.items =
    state.filters.offset === 0
      ? items
      : [...state.items, ...items.filter((item) => !state.items.some((existing) => existing.id === item.id))]
  state.hasNextPage = items.length === state.filters.limit
  state.hasLoaded = true
}

export const resetPaginatedDirectory = <TItem, TFilters extends BaseDirectoryFilters>(
  state: PaginatedDirectoryState<TItem, TFilters>,
  createFilters: () => TFilters,
): void => {
  Object.assign(state, createPaginatedDirectoryState<TItem, TFilters>(createFilters))
}

export const useDebouncedSearch = (
  source: () => string,
  onCommit: () => void,
  delay = 250,
): void => {
  watch(source, (_value, _previous, onCleanup) => {
    const timeoutId = window.setTimeout(onCommit, delay)
    onCleanup(() => window.clearTimeout(timeoutId))
  })
}

export const useDirectoryRouteSync = ({
  route,
  router,
  applyRouteState,
  buildRouteQuery,
  watchSources,
}: UseDirectoryRouteSyncOptions) => {
  const state = reactive({ isSyncing: false })

  const runWhileSyncing = async (callback: () => void | Promise<void>): Promise<void> => {
    state.isSyncing = true

    try {
      await callback()
    } finally {
      state.isSyncing = false
    }
  }

  const applyRoute = (): void => {
    state.isSyncing = true

    try {
      applyRouteState()
    } finally {
      state.isSyncing = false
    }
  }

  applyRoute()

  watch(
    () => route.query,
    () => {
      if (state.isSyncing) {
        return
      }

      applyRoute()
    },
  )

  watch(watchSources, async () => {
    if (state.isSyncing) {
      return
    }

    await runWhileSyncing(async () => {
      await router.replace({
        query: buildRouteQuery(),
      })
    })
  })

  return {
    isSyncingRouteQuery: state,
    syncRouteUpdate: runWhileSyncing,
  }
}
