'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
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
    },
    components: {
      Layout: {
        headerBg: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff',
        siderBg: currentTheme === 'dark' ? '#1f1f1f' : '#ffffff', 
        bodyBg: currentTheme === 'dark' ? '#141414' : '#f5f5f5',
        headerHeight: 64,
        headerPadding: '0 16px',
      },
      Menu: {
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemSelectedBg: currentTheme === 'dark' ? '#1890ff' : '#e6f7ff',
        itemHoverBg: currentTheme === 'dark' ? '#262626' : '#f5f5f5',
        itemColor: currentTheme === 'dark' ? '#ffffff' : '#000000d9',
        itemSelectedColor: currentTheme === 'dark' ? '#ffffff' : '#1890ff',
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, toggleTheme }}>
      <ConfigProvider theme={antdTheme}>
        <div className={currentTheme === 'dark' ? 'dark' : ''}>
          {children}
        </div>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};