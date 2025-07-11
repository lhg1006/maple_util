'use client';

import { Card, Row, Col, Skeleton, Empty, Typography } from 'antd';
import { MapleMob } from '@/types/maplestory';
import { FavoriteButton } from '@/components/favorites/favorite-button';

const { Text } = Typography;

interface MobListProps {
  mobs: MapleMob[];
  loading?: boolean;
  onMobClick?: (mobId: number) => void;
}

export const MobList: React.FC<MobListProps> = ({ mobs, loading = false, onMobClick }) => {
  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 12 }, (_, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
            <Card>
              <Skeleton active />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (mobs.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Empty 
          description="몬스터를 찾을 수 없습니다"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {mobs.map((mob) => (
        <Col key={mob.id} xs={24} sm={12} md={8} lg={6} xl={4}>
          <Card
            hoverable
            className="h-full cursor-pointer"
            onClick={() => onMobClick?.(mob.id)}
            cover={
              <div 
                className="bg-gray-50 dark:bg-gray-800" 
                style={{ 
                  height: '150px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <img
                  src={`https://maplestory.io/api/KMS/389/mob/${mob.id}/render/stand`}
                  alt={mob.name}
                  style={{ 
                    maxHeight: '140px', 
                    maxWidth: '140px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #9ca3af;">
                          <span>이미지 없음</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
            }
            style={{ height: '240px' }}
          >
            <div className="space-y-2 text-center">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text strong className="text-sm" title={mob.name} style={{ flex: 1 }}>
                  {mob.name.length > 15 ? `${mob.name.substring(0, 15)}...` : mob.name}
                </Text>
                <FavoriteButton
                  item={{
                    id: mob.id,
                    type: 'mob',
                    name: mob.name,
                    icon: `https://maplestory.io/api/KMS/389/mob/${mob.id}/render/stand`,
                    meta: {
                      level: mob.level,
                      hp: mob.hp,
                      exp: mob.exp,
                    }
                  }}
                  size="small"
                  type="text"
                />
              </div>
              
              <div className="space-y-1">
                {mob.level && (
                  <div>
                    <Text 
                      className="text-sm font-medium"
                      style={{ 
                        color: mob.level <= 10 ? '#52c41a' : 
                               mob.level <= 50 ? '#1890ff' : 
                               mob.level <= 100 ? '#fa8c16' : 
                               mob.level <= 200 ? '#f5222d' : '#722ed1'
                      }}
                    >
                      Lv. {mob.level}
                    </Text>
                  </div>
                )}
                
                <div>
                  <Text type="secondary" className="text-xs">
                    ID: {mob.id}
                  </Text>
                </div>
                
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};