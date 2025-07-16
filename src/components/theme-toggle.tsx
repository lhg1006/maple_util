'use client';

import React from 'react';
import { Button } from 'antd';
import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useTheme } from './providers/theme-provider';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  try {
    return (
      <Button
        type="text"
        icon={theme === 'light' ? <SunOutlined /> : <MoonOutlined />}
        onClick={toggleTheme}
        size="large"
      />
    );
  } catch (error) {
    return (
      <Button
        type="text"
        icon={<SunOutlined />}
        size="large"
        disabled
      />
    );
  }
};