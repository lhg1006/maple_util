import React, { useState } from 'react';
import { Layout, Typography, Space, Divider, Button } from 'antd';
import { LinkOutlined, DatabaseOutlined, ExclamationCircleOutlined, CopyrightOutlined } from '@ant-design/icons';
import { CopyrightNotice } from '../legal/copyright-notice';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

export const Footer: React.FC = () => {
  const [showCopyright, setShowCopyright] = useState(false);

  return (
    <AntFooter style={{ 
      textAlign: 'center', 
      padding: '32px 24px',
      marginTop: '48px',
      background: 'transparent'
    }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space>
          <DatabaseOutlined />
          <Text>데이터 출처:</Text>
          <Link 
            href="https://maplestory.io" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            maplestory.io API
          </Link>
        </Space>
        
        <div style={{ marginTop: '16px' }}>
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <Text strong style={{ fontSize: '13px', color: '#faad14' }}>
              개인 운영 사이트
            </Text>
          </Space>
          <br />
          <Text type="secondary" style={{ fontSize: '12px', opacity: 0.65, marginTop: '8px', display: 'block' }}>
            이 사이트는 <strong>넥슨코리아와 무관한 개인 개발자가 운영하는 서비스</strong>입니다.
          </Text>
          <Text type="secondary" style={{ fontSize: '12px', opacity: 0.65, display: 'block' }}>
            모든 메이플스토리 관련 데이터, 이미지, 아이콘의 저작권은 <strong>넥슨코리아(Nexon Korea)</strong>에 있습니다.
          </Text>
          <Text type="secondary" style={{ fontSize: '12px', opacity: 0.65, display: 'block' }}>
            이 서비스는 <strong>비상업적 목적</strong>으로만 운영되며, 메이플스토리 이용자들의 편의를 위한 정보 제공 목적입니다.
          </Text>
          <div style={{ marginTop: '8px' }}>
            <Button 
              type="link" 
              size="small" 
              icon={<CopyrightOutlined />}
              onClick={() => setShowCopyright(true)}
              style={{ padding: 0, fontSize: '11px' }}
            >
              저작권 안내 및 이용약관
            </Button>
          </div>
        </div>
      </Space>
      
      <CopyrightNotice 
        isVisible={showCopyright} 
        onClose={() => setShowCopyright(false)} 
      />
    </AntFooter>
  );
};