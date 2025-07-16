'use client';

import React from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

interface ItemErrorStateProps {
  onRetry?: () => void;
  message?: string;
  title?: string;
}

export function ItemErrorState({ 
  onRetry, 
  message = "아이템 정보를 불러올 수 없습니다.",
  title = "오류 발생"
}: ItemErrorStateProps) {
  return (
    <div style={{
      backgroundColor: '#2e2e2e',
      color: '#ffffff',
      padding: '40px',
      borderRadius: '8px',
      maxWidth: '500px',
      margin: '0 auto',
      textAlign: 'center',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      border: '2px solid #d32f2f',
    }}>
      <Result
        status="error"
        title={<span style={{ color: '#ffffff' }}>{title}</span>}
        subTitle={<span style={{ color: '#cccccc' }}>{message}</span>}
        icon={<ExclamationCircleOutlined style={{ color: '#d32f2f' }} />}
        extra={
          onRetry && (
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={onRetry}
              style={{
                backgroundColor: '#1976d2',
                borderColor: '#1976d2'
              }}
            >
              다시 시도
            </Button>
          )
        }
      />
    </div>
  );
}