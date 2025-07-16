import { render, screen, fireEvent, waitFor } from '@/__tests__/utils/test-utils'
import { ItemCard } from '@/components/items/item-card'
import { createMockMapleItem } from '@/__tests__/utils/test-utils'

// Mock the FavoriteButton component
jest.mock('@/components/favorites/favorite-button', () => {
  return {
    FavoriteButton: ({ item, size, type }: any) => (
      <button data-testid="favorite-button" data-item-id={item.id}>
        Favorite
      </button>
    ),
  }
})

describe('ItemCard', () => {
  const mockOnItemClick = jest.fn()
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders item information correctly', () => {
    const mockItem = createMockMapleItem({
      name: '테스트 검',
      category: 'One-Handed Weapon',
      price: 5000,
    })

    render(
      <ItemCard item={mockItem} onItemClick={mockOnItemClick} />
    )

    // 아이템 이름 확인
    expect(screen.getByText('테스트 검')).toBeInTheDocument()
    
    // 카테고리 번역 확인
    expect(screen.getByText('한손 무기')).toBeInTheDocument()
    
    // 가격 확인
    expect(screen.getByText('5,000 메소')).toBeInTheDocument()
    
    // 즐겨찾기 버튼 확인
    expect(screen.getByTestId('favorite-button')).toBeInTheDocument()
  })

  it('displays cash item badge when item is cash', () => {
    const mockItem = createMockMapleItem({
      cash: true,
    })

    render(<ItemCard item={mockItem} />)
    
    // 캐시 배지 확인
    const cashBadge = screen.getByTitle('캐시 아이템')
    expect(cashBadge).toBeInTheDocument()
    expect(cashBadge).toHaveTextContent('₩')
  })

  it('displays PC방 badge for PC방 items', () => {
    const mockItem = createMockMapleItem({
      name: '테스트 PC방 아이템',
    })

    render(<ItemCard item={mockItem} />)
    
    // PC방 배지 확인
    const pcBadge = screen.getByTitle('PC방 전용 아이템')
    expect(pcBadge).toBeInTheDocument()
    expect(pcBadge).toHaveTextContent('PC')
  })

  it('calls onItemClick when card is clicked', () => {
    const mockItem = createMockMapleItem()

    render(
      <ItemCard item={mockItem} onItemClick={mockOnItemClick} />
    )

    const card = screen.getByRole('img', { name: mockItem.name }).closest('.ant-card')
    fireEvent.click(card!)

    expect(mockOnItemClick).toHaveBeenCalledWith(mockItem)
  })

  it('shows item ID when no price is available', () => {
    const mockItem = createMockMapleItem({
      price: undefined,
    })

    render(<ItemCard item={mockItem} />)
    
    expect(screen.getByText(`ID: ${mockItem.id}`)).toBeInTheDocument()
  })

  it('handles image error and shows fallback', async () => {
    const mockItem = createMockMapleItem()

    render(<ItemCard item={mockItem} />)
    
    const image = screen.getByRole('img', { name: mockItem.name })
    
    // 이미지 로드 에러 시뮬레이션
    fireEvent.error(image)
    
    // fallback 이미지 로드 에러 시뮬레이션 (여러 버전 시도)
    fireEvent.error(image)
    fireEvent.error(image)
    fireEvent.error(image)
    
    await waitFor(() => {
      expect(screen.getByText('이미지 없음')).toBeInTheDocument()
    })
  })

  it('translates categories correctly', () => {
    const testCases = [
      { category: 'Accessory', expected: '장신구' },
      { category: 'Armor', expected: '방어구' },
      { category: 'Two-Handed Weapon', expected: '두손 무기' },
      { category: 'Cash', expected: '캐시' },
    ]

    testCases.forEach(({ category, expected }) => {
      const mockItem = createMockMapleItem({ category })
      
      const { unmount } = render(<ItemCard item={mockItem} />)
      
      expect(screen.getByText(expected)).toBeInTheDocument()
      
      unmount()
    })
  })

  it('shows correct category colors', () => {
    const testCases = [
      { category: 'Equip', expectedColor: 'blue' },
      { category: 'Use', expectedColor: 'green' },
      { category: 'Cash', expectedColor: 'red' },
    ]

    testCases.forEach(({ category, expectedColor }) => {
      const mockItem = createMockMapleItem({ category })
      
      const { unmount } = render(<ItemCard item={mockItem} />)
      
      // Ant Design Tag는 클래스명으로 색상을 적용하므로 클래스명 확인
      const tag = screen.getByText(category === 'Equip' ? '장비' : category === 'Use' ? '소비' : '캐시')
      expect(tag.closest('.ant-tag')).toHaveClass(`ant-tag-${expectedColor}`)
      
      unmount()
    })
  })

  it('identifies test items correctly', () => {
    const mockItem = createMockMapleItem({
      name: '테스트 아이템',
    })

    render(<ItemCard item={mockItem} />)
    
    expect(screen.getByText('테스트')).toBeInTheDocument()
  })

  it('identifies event items correctly', () => {
    const mockItem = createMockMapleItem({
      name: '이벤트 아이템 (이벤트)',
    })

    render(<ItemCard item={mockItem} />)
    
    expect(screen.getByText('이벤트')).toBeInTheDocument()
  })

  it('renders without onItemClick prop', () => {
    const mockItem = createMockMapleItem()

    render(<ItemCard item={mockItem} />)
    
    // 카드가 렌더링되는지 확인
    expect(screen.getByText(mockItem.name)).toBeInTheDocument()
    
    // 클릭해도 에러가 발생하지 않는지 확인
    const card = screen.getByRole('img', { name: mockItem.name }).closest('.ant-card')
    expect(() => fireEvent.click(card!)).not.toThrow()
  })

  it('shows premium pet label for specific pet items', () => {
    const mockItem = createMockMapleItem({
      category: 'Free Market',
      subcategory: 'Pet',
      description: '더욱 넓은 영역의 아이템을 획득할 수 있습니다',
    })

    render(<ItemCard item={mockItem} />)
    
    expect(screen.getByText('P')).toBeInTheDocument()
  })
})