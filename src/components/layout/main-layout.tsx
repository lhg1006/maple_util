'use client';

import React, { useState } from 'react';
import { Layout, Menu, Typography, Space } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HomeOutlined, 
  ShoppingOutlined, 
  UserOutlined, 
  BugOutlined,
  MenuOutlined,
  SearchOutlined,
  HeartOutlined
} from '@ant-design/icons';
import { ThemeToggle } from '../theme-toggle';
import { useTheme } from '../providers/theme-provider';
import { Footer } from './footer';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    key: '/',
    icon: <HomeOutlined />,
    label: '홈',
  },
  {
    key: '/search',
    icon: <SearchOutlined />,
    label: '통합 검색',
  },
  {
    key: '/favorites',
    icon: <HeartOutlined />,
    label: '즐겨찾기',
  },
  {
    key: '/items',
    icon: <ShoppingOutlined />,
    label: '아이템',
  },
  {
    key: '/npcs',
    icon: <UserOutlined />,
    label: 'NPC',
  },
  {
    key: '/mobs',
    icon: <BugOutlined />,
    label: '몬스터',
  },
];

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme: currentTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // 모바일 메뉴 관리
  const handleMobileMenuToggle = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
      // body 스크롤 방지
      if (!mobileMenuOpen) {
        document.body.classList.add('mobile-sidebar-open');
      } else {
        document.body.classList.remove('mobile-sidebar-open');
      }
    } else {
      setCollapsed(!collapsed);
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.classList.remove('mobile-sidebar-open');
  };

  // 메뉴 아이템 클릭 시 모바일에서 메뉴 닫기
  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(key);
    if (isMobile) {
      closeMobileMenu();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* 모바일 오버레이 배경 */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="mobile-sidebar-overlay"
          onClick={closeMobileMenu}
        />
      )}
      
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={isMobile ? false : collapsed}
        breakpoint="lg"
        collapsedWidth={0}
        onBreakpoint={(broken) => {
          setCollapsed(broken);
          setIsMobile(broken);
          if (broken) {
            setMobileMenuOpen(false);
            document.body.classList.remove('mobile-sidebar-open');
          }
        }}
        width={280}
        theme="light"
        className={isMobile ? `mobile-sidebar-container ${mobileMenuOpen ? 'open' : ''}` : ''}
        style={{ 
          height: '100vh', 
          overflowX: 'hidden',
          overflowY: 'auto',
          boxShadow: isMobile ? '4px 0 12px 0 rgba(0,0,0,.15)' : '2px 0 8px 0 rgba(29,35,41,.05)',
          background: currentTheme === 'dark' 
            ? 'linear-gradient(180deg, #1a365d 0%, #2d3748 50%, #4a5568 100%)' 
            : 'linear-gradient(180deg, #ff8c00 0%, #ff7300 50%, #ff6600 100%)',
          zIndex: isMobile ? 999 : 'auto'
        }}
      >
        <div style={{ 
          padding: '20px 16px',
          textAlign: 'center',
          background: currentTheme === 'dark' 
            ? 'rgba(255,255,255,0.08)' 
            : 'rgba(255,255,255,0.15)',
          borderBottom: currentTheme === 'dark' 
            ? '1px solid rgba(255,255,255,0.1)' 
            : '1px solid rgba(255,255,255,0.2)'
        }}>
          <Title 
            level={(!isMobile && collapsed) ? 2 : 4} 
            style={{ 
              margin: 0,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: (!isMobile && collapsed) ? '24px' : '20px',
              fontWeight: 600,
              textShadow: '0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            {(!isMobile && collapsed) ? 'MS' : '메이플스토리'}
          </Title>
          {(isMobile || !collapsed) && (
            <p style={{ margin: '4px 0 0', color: '#ffffff', fontSize: '12px', opacity: 0.9 }}>
              데이터 뷰어
            </p>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          theme="light"
          style={{ 
            border: 'none', 
            flex: 1,
            background: 'transparent',
            color: '#ffffff'
          }}
          onClick={handleMenuClick}
        />
      </Sider>
      
      <Layout>
        <Header 
          style={{ 
            height: '64px',
            lineHeight: '64px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            overflow: 'hidden',
            borderBottom: `1px solid ${currentTheme === 'dark' ? '#303030' : '#e8e8e8'}`,
            boxShadow: '0 2px 8px rgba(0,0,0,.06)',
            zIndex: 1000
          }}
        >
          <Space size="middle" style={{ overflow: 'hidden', flex: 1 }}>
            <MenuOutlined 
              style={{ 
                fontSize: '18px', 
                cursor: 'pointer',
                color: currentTheme === 'dark' ? '#ffffffa6' : '#00000073'
              }}
              onClick={handleMobileMenuToggle}
            />
            <div style={{ borderLeft: `1px solid ${currentTheme === 'dark' ? '#303030' : '#e8e8e8'}`, height: '24px' }} />
            <Title 
              level={3} 
              className="!mb-0"
              style={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 500
              }}
            >
              {pathname === '/' ? '홈' : 
               pathname === '/search' ? '통합 검색' :
               pathname === '/favorites' ? '즐겨찾기' :
               pathname === '/items' ? '아이템' :
               pathname === '/npcs' ? 'NPC' :
               pathname === '/mobs' ? '몬스터' :
 ''}
            </Title>
          </Space>
          <ThemeToggle />
        </Header>
        
        <Content 
          style={{ 
            height: 'calc(100vh - 64px)',
            width: '100%',
            overflowX: 'hidden',
            overflowY: 'auto',
            padding: 0,
            background: currentTheme === 'dark' ? '#000000' : '#f0f2f5'
          }}
        >
          <div style={{ 
            minHeight: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ 
              width: '100%', 
              maxWidth: '100%', 
              flex: 1,
              padding: isMobile ? '16px' : '24px'
            }}>
              <div style={{
                maxWidth: '1600px',
                margin: '0 auto',
                width: '100%'
              }}>
                {children}
              </div>
            </div>
            <Footer />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};