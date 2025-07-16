'use client';

import { Card, Row, Col, Typography, Spin, Empty } from 'antd';
import { MapleNPC } from '@/types/maplestory';
import Image from 'next/image';
import { useState } from 'react';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { useTheme } from '@/components/providers/theme-provider';

const { Text, Title } = Typography;

interface NPCListProps {
  npcs: MapleNPC[];
  loading: boolean;
  onNPCClick: (npcId: number) => void;
}

export const NPCList: React.FC<NPCListProps> = ({ npcs, loading, onNPCClick }) => {
  const { theme: currentTheme } = useTheme();
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
            className="border-gray-200 dark:border-gray-600"
            style={{
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
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
              background: 'linear-gradient(135deg, #f5f5f5 0%, #737373 100%)',
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Title 
                  level={5} 
                  style={{ 
                    margin: '0', 
                    fontSize: '16px',
                    fontWeight: 600,
                    color: currentTheme === 'dark' ? '#ffffff' : '#333',
                    lineHeight: '1.3',
                    flex: 1
                  }}
                  ellipsis={{ tooltip: npc.name }}
                >
                  {npc.name}
                </Title>
                <FavoriteButton
                  item={{
                    id: npc.id,
                    type: 'npc',
                    name: npc.name,
                    icon: `https://maplestory.io/api/KMS/389/npc/${npc.id}/render/stand`,
                    meta: {
                      location: npc.location,
                      description: npc.description,
                    }
                  }}
                  size="small"
                  type="text"
                />
              </div>

              {npc.location && (
                <Text 
                  style={{ 
                    fontSize: '12px', 
                    color: currentTheme === 'dark' ? '#4fc3f7' : '#1890ff',
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