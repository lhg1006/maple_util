'use client';

import { Card, Row, Col, Typography, Spin, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { MapleNPC } from '@/types/maplestory';
import Image from 'next/image';
import { useState } from 'react';

const { Text, Title } = Typography;

interface NPCListProps {
  npcs: MapleNPC[];
  loading: boolean;
  onNPCClick: (npcId: number) => void;
}

export const NPCList: React.FC<NPCListProps> = ({ npcs, loading, onNPCClick }) => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <Spin size="large" tip="NPC 정보를 불러오는 중...">
          <div style={{ minHeight: '200px' }} />
        </Spin>
      </div>
    );
  }

  if (npcs.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <Title level={4} style={{ color: '#999' }}>
              검색 결과가 없습니다
            </Title>
            <Text style={{ color: '#666' }}>
              다른 검색어를 입력해보세요.
            </Text>
          </div>
        }
      />
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {npcs.map((npc) => (
        <Col xs={24} sm={12} md={8} lg={6} xl={4} key={npc.id}>
          <Card
            hoverable
            onClick={() => onNPCClick(npc.id)}
            style={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '1px solid #e8e8e8'
            }}
            styles={{
              body: {
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              }
            }}
          >
            {/* NPC 이미지 */}
            <div style={{ 
              width: '80px', 
              height: '80px', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {!imageErrors.has(npc.id) ? (
                <Image
                  src={`https://maplestory.io/api/KMS/389/npc/${npc.id}/render/stand`}
                  alt={`${npc.name} NPC 이미지`}
                  width={64}
                  height={64}
                  style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%'
                  }}
                  onError={() => {
                    setImageErrors(prev => new Set([...prev, npc.id]));
                  }}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '100%', 
                  height: '100%', 
                  color: '#999' 
                }}>
                  <span style={{ fontSize: '24px' }}>👤</span>
                </div>
              )}
            </div>

            {/* NPC 정보 */}
            <div style={{ flex: 1, width: '100%' }}>
              <Title 
                level={5} 
                style={{ 
                  margin: '0 0 12px 0', 
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#333',
                  lineHeight: '1.3'
                }}
                ellipsis={{ tooltip: npc.name }}
              >
                {npc.name}
              </Title>

              {npc.location && (
                <Text 
                  style={{ 
                    fontSize: '12px', 
                    color: '#1890ff',
                    display: 'block'
                  }}
                  ellipsis={{ tooltip: npc.location }}
                >
                  📍 {npc.location}
                </Text>
              )}
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};