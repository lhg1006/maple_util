import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConfigProvider } from 'antd'
import { ThemeProvider } from '@/components/providers/theme-provider'

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  })

interface AllTheProvidersProps {
  children: React.ReactNode
}

// Wrapper component that includes all providers
const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ConfigProvider>
          {children}
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: React.ReactNode }>
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => render(ui, { wrapper: AllTheProviders, ...options })

// Create mock data for testing
export const createMockMapleItem = (overrides = {}) => ({
  id: 1001,
  name: '테스트 아이템',
  description: '테스트용 아이템입니다.',
  icon: 'https://maplestory.io/api/KMS/389/item/1001/icon',
  category: 'Equip',
  level: 10,
  cash: false,
  requirements: {
    level: 10,
    str: 0,
    dex: 0,
    int: 0,
    luk: 0,
    job: 0,
  },
  stats: {
    str: 5,
    dex: 0,
    int: 0,
    luk: 0,
  },
  combat: {
    attack: 15,
    magicAttack: 0,
    defense: 0,
    magicDefense: 0,
    accuracy: 0,
    avoidability: 0,
    speed: 0,
    jump: 0,
  },
  enhancement: {
    upgradeSlots: 7,
  },
  price: 1000,
  ...overrides,
})

export const createMockJob = (overrides = {}) => ({
  id: 100,
  name: '초보자',
  category: 'beginner',
  advancement: 0,
  description: '모든 직업의 시작점',
  ...overrides,
})

export const createMockNPC = (overrides = {}) => ({
  id: 1000001,
  name: '테스트 NPC',
  description: '테스트용 NPC입니다.',
  mapId: 100000000,
  mapName: '테스트 맵',
  ...overrides,
})

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }
export { createTestQueryClient }

// Dummy test to prevent "no tests" error
describe('Test Utils', () => {
  it('should export render function', () => {
    expect(typeof customRender).toBe('function')
  })
})