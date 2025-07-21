'use client';

import { Card, Row, Col, Skeleton, Empty, Typography } from 'antd';
import { MapleMob } from '@/types/maplestory';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { useTheme } from '@/components/providers/theme-provider';

const { Text } = Typography;

interface MobListProps {
  mobs: MapleMob[];
  loading?: boolean;
  onMobClick?: (mobId: number) => void;
}

export const MobList: React.FC<MobListProps> = ({ mobs, loading = false, onMobClick }) => {
  const { theme: currentTheme } = useTheme();
  if (loading) {
    return (
      <Row gutter={[8, 12]}>
        {Array.from({ length: 12 }, (_, index) => (
          <Col key={index} xs={12} sm={12} md={8} lg={6} xl={4}>
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
    <Row gutter={[8, 12]}>
      {mobs.map((mob) => (
        <Col key={mob.id} xs={12} sm={12} md={8} lg={6} xl={4}>
          <Card
            hoverable
            className="h-full cursor-pointer border-gray-200 dark:border-gray-600"
            onClick={() => onMobClick?.(mob.id)}
            cover={
              <div 
                style={{ 
                  height: 'clamp(140px, 20vw, 170px)',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #737373 100%)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <img
                  src={`https://maplestory.io/api/KMS/389/mob/${mob.id}/render/stand`}
                  alt={mob.name}
                  style={{ 
                    maxHeight: 'clamp(100px, 12vw, 140px)', 
                    maxWidth: 'clamp(100px, 12vw, 140px)',
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
            style={{ height: 'clamp(220px, 35vw, 280px)' }}
            bodyStyle={{ padding: 'clamp(8px, 2vw, 16px)' }}
          >
            <div 
              className="space-y-2 text-center" 
              style={{ 
                width: '100%', 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 'clamp(60px, 12vw, 90px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', overflow: 'hidden' }}>
                <Text 
                  strong 
                  className="text-xs sm:text-sm" 
                  title={mob.name} 
                  style={{ 
                    flex: 1,
                    color: currentTheme === 'dark' ? '#ffffff' : '#111827',
                    fontSize: 'clamp(11px, 2.5vw, 14px)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {mob.name}
                </Text>
                <FavoriteButton
                  item={{
                    id: mob.id,
                    type: 'mob',
                    name: mob.name,
                    icon: `https://maplestory.io/api/KMS/389/mob/${mob.id}/render/stand`,
                    meta: {
                      level: mob.level,
                    }
                  }}
                  size="small"
                  type="text"
                />
              </div>
              
              <div className="space-y-1" style={{ flexShrink: 0 }}>
                {mob.level && (
                  <div>
                    <Text 
                      className="text-xs sm:text-sm font-medium"
                      style={{ 
                        color: mob.level <= 10 ? '#52c41a' : 
                               mob.level <= 50 ? '#1890ff' : 
                               mob.level <= 100 ? '#fa8c16' : 
                               mob.level <= 200 ? '#f5222d' : '#722ed1',
                        fontSize: 'clamp(10px, 2.2vw, 13px)'
                      }}
                    >
                      Lv. {mob.level}
                    </Text>
                  </div>
                )}
                
                <div style={{ width: '100%', overflow: 'hidden' }}>
                  <Text 
                    type="secondary" 
                    className="text-xs"
                    style={{ 
                      fontSize: 'clamp(9px, 2vw, 12px)',
                      wordBreak: 'break-all',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      display: 'block',
                      width: '100%'
                    }}
                  >
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