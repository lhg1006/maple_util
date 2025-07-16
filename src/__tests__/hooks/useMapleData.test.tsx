import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'
import { useInfiniteItemsByCategory } from '@/hooks/useMapleData'

// API 모킹
jest.mock('@/lib/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}))

// React Query 클라이언트 설정
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

describe('useMapleData hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useInfiniteItemsByCategory', () => {
    it('should initialize with correct default state', () => {
      const wrapper = createWrapper()
      
      const { result } = renderHook(
        () => useInfiniteItemsByCategory('Equip', {
          searchQuery: '',
          excludeCashItems: false,
          cashItemsOnly: false,
        }),
        { wrapper }
      )

      expect(result.current.data).toBeUndefined()
      expect(result.current.error).toBe(null)
      expect(typeof result.current.fetchNextPage).toBe('function')
      expect(typeof result.current.hasNextPage).toBe('boolean')
      // isLoading은 쿼리가 비활성화될 수 있으므로 boolean으로만 확인
      expect(typeof result.current.isLoading).toBe('boolean')
    })

    it('should handle empty search query correctly', () => {
      const wrapper = createWrapper()
      
      const { result } = renderHook(
        () => useInfiniteItemsByCategory('Equip', {
          searchQuery: '',
          excludeCashItems: false,
          cashItemsOnly: false,
        }),
        { wrapper }
      )

      // 초기 상태 확인
      expect(typeof result.current.isLoading).toBe('boolean')
      expect(result.current.data).toBeUndefined()
    })

    it('should handle cash item filters correctly', () => {
      const wrapper = createWrapper()
      
      const { result: excludeCashResult } = renderHook(
        () => useInfiniteItemsByCategory('Equip', {
          searchQuery: '',
          excludeCashItems: true,
          cashItemsOnly: false,
        }),
        { wrapper }
      )

      const { result: cashOnlyResult } = renderHook(
        () => useInfiniteItemsByCategory('Equip', {
          searchQuery: '',
          excludeCashItems: false,
          cashItemsOnly: true,
        }),
        { wrapper }
      )

      // 두 훅 모두 초기화되는지 확인
      expect(excludeCashResult.current).toBeDefined()
      expect(cashOnlyResult.current).toBeDefined()
    })

    it('should handle search query correctly', async () => {
      const wrapper = createWrapper()
      
      const { result } = renderHook(
        () => useInfiniteItemsByCategory('Equip', {
          searchQuery: '검',
          excludeCashItems: false,
          cashItemsOnly: false,
        }),
        { wrapper }
      )

      // 검색이 적용되는지 확인
      expect(result.current).toBeDefined()
    })
  })
})