'use client';

import React, { useState, useEffect } from 'react';
import { Button, notification, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { usePWA } from '@/hooks/usePWA';

export function UpdatePrompt() {
  const { isUpdateAvailable, updateServiceWorker } = usePWA();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    if (isUpdateAvailable) {
      const key = 'update-available';
      
      notification.info({
        key,
        message: '새 버전 사용 가능',
        description: '더 나은 성능과 새로운 기능이 포함된 업데이트가 있습니다.',
        icon: <ReloadOutlined style={{ color: '#1890ff' }} />,
        duration: 0, // 자동으로 닫히지 않음
        placement: 'bottomRight',
        btn: (
          <Space>
            <Button
              type="text"
              size="small"
              onClick={() => notification.destroy(key)}
            >
              나중에
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => {
                updateServiceWorker();
                notification.destroy(key);
              }}
            >
              지금 업데이트
            </Button>
          </Space>
        ),
      });
    }
  }, [isClient, isUpdateAvailable, updateServiceWorker]);

  return null;
}