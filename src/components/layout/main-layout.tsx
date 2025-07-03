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
  MenuOutlined
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
        width={200}
        style={{ 
          height: '100vh', 
          overflowX: 'hidden',
          overflowY: 'auto',
          borderRight: `1px solid ${currentTheme === 'dark' ? '#303030' : '#f0f0f0'}`
        }}
      >
        <div className="p-4" style={{ overflow: 'hidden', marginTop: '20px', marginBottom: '24px' }}>
          <Title 
            level={4} 
            className="!mb-0 text-center" 
            style={{ 
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {collapsed ? 'MS' : '메이플스토리'}
          </Title>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          style={{ border: 'none', flex: 1 }}
          onClick={({ key }) => router.push(key)}
        />
      </Sider>
      
      <Layout>
        <Header 
          style={{ 
            height: '64px',
            lineHeight: '64px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            overflow: 'hidden',
            borderBottom: `1px solid ${currentTheme === 'dark' ? '#303030' : '#f0f0f0'}`
          }}
        >
          <Space style={{ overflow: 'hidden', flex: 1 }}>
            <MenuOutlined 
              className="text-lg cursor-pointer hover:text-blue-500"
              onClick={() => setCollapsed(!collapsed)}
            />
            <Title 
              level={3} 
              className="!mb-0"
              style={{ 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: isMobile ? '16px' : '20px'
              }}
            >
              {isMobile ? '메이플 유틸' : '메이플스토리 유틸리티'}
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
            padding: isMobile ? '8px' : '16px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ 
            width: '100%', 
            maxWidth: '100%', 
            overflowX: 'hidden',
            overflowY: 'auto',
            flex: 1,
            minHeight: 0
          }}>
            {children}
          </div>
          <Footer />
        </Content>
      </Layout>
    </Layout>
  );
};