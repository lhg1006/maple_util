import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';
import { LinkOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

export const Footer: React.FC = () => {
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
            >
              GitHub Repository
            </Link>
          </Space>
        </Space>
        
        <div style={{ marginTop: '16px' }}>
          <Text type="secondary" style={{ fontSize: '13px', opacity: 0.65 }}>
            이 사이트는 maplestory.io API에서 제공하는 데이터를 기반으로 제작되었습니다.
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px', opacity: 0.45 }}>
            본 서비스를 통해 제공되는 모든 미디어, 아이콘, 설명 및 캐릭터 정보는 넥슨의 독점 재산이며, 넥슨 서비스 약관이 적용됩니다.
          </Text>
        </div>
      </Space>
    </AntFooter>
  );
};