'use client';

import { Card, Row, Col, Typography, Collapse, Badge, Space } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { MapleNPC } from '@/types/maplestory';
import { useState } from 'react';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface NPCMapGroupProps {
  npcs: MapleNPC[];
  loading: boolean;
  onNPCClick: (npcId: number) => void;
}

export const NPCMapGroup: React.FC<NPCMapGroupProps> = ({ npcs, loading, onNPCClick }) => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  // 중복 제거
  const uniqueNPCs = npcs.filter((npc, index, array) => 
    array.findIndex(n => n.id === npc.id) === index
  );

  // 맵별로 NPC 그룹화
  const npcsByMap = uniqueNPCs.reduce((acc, npc) => {
    const mapName = npc.map?.name || npc.location || '알 수 없는 맵';
    if (!acc[mapName]) {
      acc[mapName] = [];
    }
    acc[mapName].push(npc);
    return acc;
  }, {} as Record<string, MapleNPC[]>);

  // 맵 이름으로 정렬
  const sortedMapNames = Object.keys(npcsByMap).sort();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div>NPC 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Space>
          <EnvironmentOutlined style={{ color: '#1890ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            맵별 NPC 목록
          </Title>
          <Badge count={sortedMapNames.length} style={{ backgroundColor: '#52c41a' }} />
        </Space>
      </div>

      <Collapse
        accordion={false}
        defaultActiveKey={sortedMapNames.slice(0, 3)} // 처음 3개 맵만 기본으로 열기
        className="dark:bg-gray-800"
      >
        {sortedMapNames.map(mapName => {
          const mapNPCs = npcsByMap[mapName];
          return (
            <Panel
              key={mapName}
              header={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <EnvironmentOutlined style={{ color: '#1890ff' }} />
                  <span style={{ fontWeight: 500 }}>{mapName}</span>
                  <Badge 
                    count={mapNPCs.length} 
                    style={{ backgroundColor: '#722ed1' }}
                  />
                </div>
              }
              style={{ marginBottom: '8px' }}
            >
              <div className="bg-gray-50 dark:bg-gray-700" style={{ 
                padding: '16px',
                borderRadius: '6px',
                margin: '-12px'
              }}>
                <Row gutter={[12, 12]}>
                  {mapNPCs.map((npc) => (
                    <Col xs={24} sm={12} md={8} lg={6} xl={4} key={npc.id}>
                      <Card
                        size="small"
                        hoverable
                        onClick={() => onNPCClick(npc.id)}
                        className="border-gray-200 dark:border-gray-600"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease'
                        }}
                        styles={{
                          body: {
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }
                        }}
                      >
                        {/* NPC 이미지 */}
                        <div style={{ 
                          width: '60px', 
                          height: '60px', 
                          marginBottom: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'transparent',
                          borderRadius: '6px',
                          overflow: 'hidden'
                        }}>
                          {!imageErrors.has(npc.id) ? (
                            <img
                              src={`https://maplestory.io/api/KMS/389/npc/${npc.id}/render/stand`}
                              alt={`${npc.name} NPC 이미지`}
                              style={{
                                width: '48px',
                                height: '48px',
                                objectFit: 'contain'
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
                              <span style={{ fontSize: '20px' }}>👤</span>
                            </div>
                          )}
                        </div>

                        {/* NPC 정보 */}
                        <div style={{ width: '100%' }}>
                          <Text 
                            strong 
                            className="text-gray-900 dark:text-white"
                            style={{ 
                              fontSize: '12px',
                              display: 'block',
                              marginBottom: '4px'
                            }}
                            ellipsis={{ tooltip: npc.name }}
                          >
                            {npc.name}
                          </Text>
                          
                          <Text 
                            className="text-gray-600 dark:text-gray-400"
                            style={{ 
                              fontSize: '10px'
                            }}
                          >
                            ID: {npc.id}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            </Panel>
          );
        })}
      </Collapse>
    </div>
  );
};