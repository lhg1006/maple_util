'use client';

import React from 'react';
import { Alert, Space, Typography } from 'antd';
import { DisconnectOutlined } from '@ant-design/icons';
import { usePWA } from '@/hooks/usePWA';

const { Text } = Typography;

export function OfflineStatus() {
  const { isOnline, getOfflineCapabilities } = usePWA();
  const capabilities = getOfflineCapabilities();

  if (isOnline) return null;

  return (
    <Alert
      message={
        <Space>
          <DisconnectOutlined />
          <Text strong>오프라인 모드</Text>
        </Space>
      }
      description={
        <div>
          <Text>인터넷 연결이 끊어졌습니다. 다음 기능들은 계속 사용할 수 있습니다:</Text>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
            {capabilities.favorites && <li>즐겨찾기 목록 보기</li>}
            {capabilities.searchHistory && <li>검색 기록 확인</li>}
            {capabilities.cachedData && <li>캐시된 데이터 보기</li>}
          </ul>
        </div>
      }
      type="warning"
      showIcon
      style={{
        position: 'fixed',
        top: 70,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        maxWidth: '500px',
        width: '90%'
      }}
    />
  );
}