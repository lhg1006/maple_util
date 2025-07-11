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
        <Space split={<Divider type="vertical" />} wrap>
          <Space>
            <DatabaseOutlined />
            <Text>데이터 출처:</Text>
            <Link 
              href="https://maplestory.io" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              maplestory.io
            </Link>
          </Space>
          
          <Space>
            <LinkOutlined />
            <Text>CDN:</Text>
            <Link 
              href="https://github.com/lhg1006/maple-util-data" 
              target="_blank" 
              rel="noopener noreferrer"
              title="비상업적 교육 목적으로만 사용됩니다"
            >
              GitHub Repository
            </Link>
            <Text type="secondary" style={{ fontSize: '10px' }}>
              (교육용)
            </Text>
          </Space>
        </Space>
        
        <div style={{ marginTop: '16px' }}>
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            <Text strong style={{ fontSize: '13px', color: '#faad14' }}>
              비공식 팬 사이트
            </Text>
          </Space>
          <br />
          <Text type="secondary" style={{ fontSize: '12px', opacity: 0.65, marginTop: '8px', display: 'block' }}>
            이 사이트는 <strong>넥슨코리아와 무관한 개인 개발자가 운영하는 비공식 팬 사이트</strong>입니다.
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