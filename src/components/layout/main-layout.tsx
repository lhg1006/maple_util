'use client';

import React, { useState } from 'react';
import { Layout, Menu, Typography, Space } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HomeOutlined, 
  ShoppingOutlined, 
  UserOutlined, 
  BugOutlined,
  TeamOutlined,
  ThunderboltOutlined,
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
  {
    key: '/jobs',
    icon: <TeamOutlined />,
    label: '직업',
  },
  {
    key: '/skills',
    icon: <ThunderboltOutlined />,
    label: '스킬',
  },
];

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme: currentTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Layout style={{ minHeight: '100vh', height: '100vh', width: '100%', overflow: 'hidden' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        breakpoint="lg"
        collapsedWidth={isMobile ? 0 : 80}
        onBreakpoint={(broken) => {
          setCollapsed(broken);
          setIsMobile(broken);
        }}
        width={240}
        theme="dark"
        style={{ 
          height: '100vh', 
          overflowX: 'hidden',
          overflowY: 'auto',
          boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)'
        }}
      >
        <div style={{ 
          padding: '20px 16px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.025)'
        }}>
          <Title 
            level={collapsed ? 2 : 4} 
            style={{ 
              margin: 0,
              color: '#ffffff',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: collapsed ? '24px' : '20px',
              fontWeight: 600
            }}
          >
            {collapsed ? 'MS' : '메이플스토리'}
          </Title>
          {!collapsed && (
            <p style={{ margin: '4px 0 0', color: '#ffffff73', fontSize: '12px' }}>
              유틸리티
            </p>
          )}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          theme="dark"
          style={{ 
            border: 'none', 
            flex: 1,
            background: 'transparent'
          }}
          onClick={({ key }) => router.push(key)}
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
            zIndex: 10
          }}
        >
          <Space size="middle" style={{ overflow: 'hidden', flex: 1 }}>
            <MenuOutlined 
              style={{ 
                fontSize: '18px', 
                cursor: 'pointer',
                color: currentTheme === 'dark' ? '#ffffffa6' : '#00000073'
              }}
              onClick={() => setCollapsed(!collapsed)}
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
               pathname === '/jobs' ? '직업' :
               pathname === '/skills' ? '스킬' : ''}
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