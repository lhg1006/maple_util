import React from 'react';
import { Layout, Typography, Space, Divider } from 'antd';
import { LinkOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Link } = Typography;

export const Footer: React.FC = () => {
  return (
    <AntFooter style={{ 
      textAlign: 'center', 
      padding: '24px 16px',
      borderTop: '1px solid #f0f0f0',
      backgroundColor: 'var(--ant-color-bg-container)'
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
        
        <Text type="secondary" style={{ fontSize: '12px' }}>
          이 사이트는 maplestory.io API에서 제공하는 데이터를 기반으로 제작되었습니다.
          <br />
          모든 게임 데이터의 저작권은 넥슨(NEXON)에 있습니다.
        </Text>
      </Space>
    </AntFooter>
  );
};