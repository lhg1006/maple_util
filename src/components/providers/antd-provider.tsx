'use client';

import React, { useEffect } from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ant Design React 호환성 경고 억제
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args) => {
      const message = args[0];
      if (typeof message === 'string') {
        if (message.includes('antd v5 support React is 16 ~ 18') ||
            message.includes('antd: compatible') ||
            message.includes('see https://u.ant.design/v5-for-19') ||
            message.includes('[antd: compatible]')) {
          return; // 경고 무시
        }
      }
      originalWarn(...args);
    };

    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string') {
        if (message.includes('antd v5 support React is 16 ~ 18') ||
            message.includes('antd: compatible') ||
            message.includes('see https://u.ant.design/v5-for-19') ||
            message.includes('[antd: compatible]')) {
          return; // 에러 무시
        }
      }
      originalError(...args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <AntdRegistry>
      {children}
    </AntdRegistry>
  );
}