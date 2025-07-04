'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme, App } from 'antd';
import { ThemeConfig } from 'antd/es/config-provider/context';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setCurrentTheme(newTheme);
    if (mounted) {
      localStorage.setItem('theme', newTheme);
    }
  };

  const antdTheme: ThemeConfig = {
    algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 8,
      colorBgContainer: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff',
      colorBgElevated: currentTheme === 'dark' ? '#141414' : '#ffffff',
      colorBorder: currentTheme === 'dark' ? '#303030' : '#d9d9d9',
      colorText: currentTheme === 'dark' ? '#ffffffd9' : '#000000d9',
      colorTextSecondary: currentTheme === 'dark' ? '#ffffff8c' : '#00000073',
    },
    components: {
      Layout: {
        headerBg: currentTheme === 'dark' ? '#141414' : '#ffffff',
        siderBg: currentTheme === 'dark' ? '#0f0f0f' : '#001529', 
        bodyBg: currentTheme === 'dark' ? '#000000' : '#f0f2f5',
        headerHeight: 64,
        headerPadding: '0 24px',
        footerBg: currentTheme === 'dark' ? '#0f0f0f' : '#f0f2f5',
        footerPadding: '24px 50px',
      },
      Menu: {
        darkItemBg: '#0f0f0f',
        darkSubMenuItemBg: '#000000',
        darkItemSelectedBg: '#1890ff',
        darkItemHoverBg: '#1890ff33',
        darkItemColor: '#ffffffa6',
        darkItemSelectedColor: '#ffffff',
        darkItemHoverColor: '#ffffff',
      },
      Card: {
        colorBgContainer: currentTheme === 'dark' ? '#141414' : '#ffffff',
        colorBorder: currentTheme === 'dark' ? '#303030' : '#f0f0f0',
        boxShadow: currentTheme === 'dark' 
          ? '0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15)' 
          : '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
      },
      Modal: {
        contentBg: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff',
        headerBg: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff',
        footerBg: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff',
        colorBorder: currentTheme === 'dark' ? '#303030' : '#f0f0f0',
      },
      Table: {
        colorBgContainer: currentTheme === 'dark' ? '#141414' : '#ffffff',
        headerBg: currentTheme === 'dark' ? '#1f1f1f' : '#fafafa',
        rowHoverBg: currentTheme === 'dark' ? '#262626' : '#fafafa',
        colorBorderSecondary: currentTheme === 'dark' ? '#303030' : '#f0f0f0',
      },
      Input: {
        colorBgContainer: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff',
        colorBorder: currentTheme === 'dark' ? '#303030' : '#d9d9d9',
        colorText: currentTheme === 'dark' ? '#ffffffd9' : '#000000d9',
        colorTextPlaceholder: currentTheme === 'dark' ? '#ffffff3f' : '#00000040',
      },
      Button: {
        colorBgContainer: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff',
        colorBorder: currentTheme === 'dark' ? '#303030' : '#d9d9d9',
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <ConfigProvider theme={antdTheme}>
        <App>
          <div className={currentTheme === 'dark' ? 'dark' : ''}>
            {children}
          </div>
        </App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};