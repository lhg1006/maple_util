'use client';

import React from 'react';
import { Button, Card, Space, Typography } from 'antd';
import { DownloadOutlined, MobileOutlined, CloseOutlined } from '@ant-design/icons';
import { usePWA } from '@/hooks/usePWA';

const { Title, Paragraph } = Typography;

interface InstallPromptProps {
  onClose?: () => void;
  compact?: boolean;
}

export function InstallPrompt({ onClose, compact = false }: InstallPromptProps) {
  const { canInstall, install } = usePWA();

  if (!canInstall) return null;

  const handleInstall = async () => {
    const success = await install();
    if (success && onClose) {
      onClose();
    }
  };

  if (compact) {
    return (
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        maxWidth: '320px'
      }}>
        <Card
          size="small"
          actions={[
            <Button 
              key="install"
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleInstall}
              size="small"
            >
              설치
            </Button>,
            <Button 
              key="close"
              type="text" 
              icon={<CloseOutlined />}
              onClick={onClose}
              size="small"
            />
          ]}
        >
          <Space>
            <MobileOutlined style={{ fontSize: 24, color: '#1890ff' }} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                앱으로 설치
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                더 빠른 접근과 오프라인 사용
              </div>
            </div>
          </Space>
        </Card>
      </div>
    );
  }

  return (
    <Card
      title={
        <Space>
          <MobileOutlined style={{ color: '#1890ff' }} />
          <span>앱으로 설치하기</span>
        </Space>
      }
      extra={
        onClose && (
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        )
      }
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            메이플스토리 유틸리티를 앱으로 설치하세요
          </Title>
          <Paragraph style={{ margin: '8px 0' }}>
            홈 화면에 추가하여 더 빠르게 접근하고 오프라인에서도 사용할 수 있습니다.
          </Paragraph>
        </div>

        <div>
          <Title level={5} style={{ margin: '0 0 8px 0' }}>
            설치 시 장점:
          </Title>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>빠른 로딩 및 성능 향상</li>
            <li>오프라인에서도 캐시된 데이터 사용 가능</li>
            <li>즐겨찾기 및 검색 기록 유지</li>
            <li>홈 화면에서 바로 접근</li>
            <li>네이티브 앱과 같은 경험</li>
          </ul>
        </div>

        <Button
          type="primary"
          size="large"
          icon={<DownloadOutlined />}
          onClick={handleInstall}
          block
        >
          지금 설치하기
        </Button>
      </Space>
    </Card>
  );
}