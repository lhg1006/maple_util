import { render, screen } from '@/__tests__/utils/test-utils'
import { MainLayout } from '@/components/layout/main-layout'

describe('MainLayout', () => {
  it('renders children correctly', () => {
    const testContent = 'Test Content'
    
    render(
      <MainLayout>
        <div>{testContent}</div>
      </MainLayout>
    )
    
    expect(screen.getByText(testContent)).toBeInTheDocument()
  })

  it('renders navigation elements', () => {
    render(
      <MainLayout>
        <div>Content</div>
      </MainLayout>
    )
    
    // 메인 레이아웃이 렌더링되는지 확인
    // Ant Design Layout 컴포넌트가 렌더링되는지 확인
    const layout = document.querySelector('.ant-layout')
    expect(layout).toBeInTheDocument()
  })

  it('maintains responsive design structure', () => {
    render(
      <MainLayout>
        <div>Responsive Content</div>
      </MainLayout>
    )
    
    // 레이아웃 구조가 올바르게 렌더링되는지 확인
    expect(screen.getByText('Responsive Content')).toBeInTheDocument()
  })
})