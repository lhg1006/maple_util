'use client';

import { Card, Typography } from 'antd';
import { ReactNode, useState, useEffect } from 'react';
import { mapleAPI } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;

interface FlipCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
  onClick: () => void;
  type: 'item' | 'npc' | 'mob' | 'job';
}

interface RandomData {
  id: number;
  name: string;
  image?: string;
  description?: string;
  level?: number;
  location?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({ 
  title, 
  description, 
  icon, 
  color, 
  onClick,
  type 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [randomData, setRandomData] = useState<RandomData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트에서만 실행되도록 하여 hydration 에러 방지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 고정된 데이터 가져오기
  const fetchFixedData = async () => {
    if (type === 'job') return; // 직업은 아직 미구현
    
    setIsLoading(true);
    try {
      switch (type) {
        case 'item':
          // 메이플 소드 (ID: 1302000)
          try {
            const item = await mapleAPI.getItem(1302000);
            setRandomData({
              id: item.id,
              name: item.name,
              image: `https://maplestory.io/api/KMS/389/item/${item.id}/icon`,
              description: item.description || '초보자용 기본 한손검',
            });
          } catch (error) {
            console.error('Failed to fetch Maple Sword:', error);
            // 실패 시 기본 데이터
            setRandomData({
              id: 1302000,
              name: '메이플 소드',
              image: `https://maplestory.io/api/KMS/389/item/1302000/icon`,
              description: '초보자용 기본 한손검',
            });
          }
          break;
          
        case 'npc':
          // 메이플 운영자 (ID: 9010000)
          try {
            const npc = await mapleAPI.getNPC(9010000);
            setRandomData({
              id: npc.id,
              name: npc.name || '메이플 운영자',
              image: `https://maplestory.io/api/KMS/389/npc/${npc.id}/render/stand`,
              location: npc.location || '이벤트 맵',
            });
          } catch (error) {
            console.error('Failed to fetch Maple Administrator:', error);
            // 실패 시 기본 데이터
            setRandomData({
              id: 9010000,
              name: '메이플 운영자',
              image: `https://maplestory.io/api/KMS/389/npc/9010000/render/stand`,
              location: '이벤트 맵',
            });
          }
          break;
          
        case 'mob':
          // 머쉬맘 (ID: 6130101)
          try {
            const mob = await mapleAPI.getMob(6130101);
            setRandomData({
              id: mob.id,
              name: mob.name || '머쉬맘',
              image: `https://maplestory.io/api/KMS/389/mob/${mob.id}/render/stand`,
              level: mob.level || 15,
            });
          } catch (error) {
            console.error('Failed to fetch Mushmom:', error);
            // 실패 시 기본 데이터
            setRandomData({
              id: 6130101,
              name: '머쉬맘',
              image: `https://maplestory.io/api/KMS/389/mob/6130101/render/stand`,
              level: 15,
            });
          }
          break;
      }
    } catch (error) {
      console.error('Failed to fetch fixed data:', error);
    }
    setIsLoading(false);
  };

  // 호버 시 데이터 가져오기
  useEffect(() => {
    if (isFlipped && !randomData && !isLoading && isMounted) {
      fetchFixedData();
    }
  }, [isFlipped, isMounted]);

  // 서버 렌더링 중에는 기본 상태만 표시
  if (!isMounted) {
    return (
      <Card 
        className="flip-card-front text-center hover:shadow-md"
        style={{ 
          height: '100%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClick}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          padding: '20px'
        }}>
          <div style={{ 
            fontSize: 'clamp(32px, 8vw, 48px)', 
            color, 
            marginBottom: 'clamp(8px, 2vw, 16px)' 
          }}>
            {icon}
          </div>
          <Title 
            level={4} 
            style={{ 
              fontSize: 'clamp(16px, 4vw, 20px)',
              marginBottom: 'clamp(8px, 2vw, 16px)',
              margin: 0
            }}
          >
            {title}
          </Title>
          <Paragraph style={{ 
            marginTop: 'clamp(8px, 2vw, 16px)',
            fontSize: 'clamp(12px, 3vw, 14px)',
            lineHeight: '1.4',
            marginBottom: 0
          }}>
            {description}
          </Paragraph>
        </div>
      </Card>
    );
  }

  return (
    <div 
      className="flip-card-container"
      style={{ height: '100%', perspective: '1000px' }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={onClick}
    >
      <div 
        className="flip-card-inner"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transition: 'transform 0.6s',
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* 앞면 */}
        <Card 
          className="flip-card-front text-center hover:shadow-md"
          style={{ 
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            padding: '20px'
          }}>
            <div style={{ 
              fontSize: 'clamp(32px, 8vw, 48px)', 
              color, 
              marginBottom: 'clamp(8px, 2vw, 16px)' 
            }}>
              {icon}
            </div>
            <Title 
              level={4} 
              style={{ 
                fontSize: 'clamp(16px, 4vw, 20px)',
                marginBottom: 'clamp(8px, 2vw, 16px)',
                margin: 0
              }}
            >
              {title}
            </Title>
            <Paragraph style={{ 
              marginTop: 'clamp(8px, 2vw, 16px)',
              fontSize: 'clamp(12px, 3vw, 14px)',
              lineHeight: '1.4',
              marginBottom: 0
            }}>
              {description}
            </Paragraph>
          </div>
        </Card>

        {/* 뒷면 */}
        <Card 
          className="flip-card-back"
          style={{ 
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${color}15 0%, ${color}30 100%)`,
            border: `2px solid ${color}40`,
          }}
        >
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: 'clamp(20px, 5vw, 40px)' }}>
              <div className="loading-spinner" style={{
                width: 'clamp(30px, 6vw, 40px)',
                height: 'clamp(30px, 6vw, 40px)',
                border: `3px solid ${color}30`,
                borderTop: `3px solid ${color}`,
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite',
              }} />
              <Text style={{ 
                display: 'block', 
                marginTop: 'clamp(8px, 2vw, 16px)', 
                color: '#666',
                fontSize: 'clamp(11px, 2.5vw, 13px)'
              }}>
                정보를 불러오는 중...
              </Text>
            </div>
          ) : randomData ? (
            <div style={{ textAlign: 'center', padding: 'clamp(8px, 2vw, 16px)' }}>
              {randomData.image && (
                <div style={{ 
                  height: 'clamp(60px, 12vw, 80px)', 
                  marginBottom: 'clamp(8px, 2vw, 16px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={randomData.image}
                    alt={randomData.name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <Title 
                level={5} 
                style={{ 
                  color, 
                  marginBottom: 'clamp(4px, 1vw, 8px)',
                  fontSize: 'clamp(14px, 3vw, 16px)'
                }}
              >
                {randomData.name}
              </Title>
              {randomData.level && (
                <Text style={{ 
                  display: 'block', 
                  marginBottom: 'clamp(2px, 0.5vw, 4px)',
                  fontSize: 'clamp(11px, 2.5vw, 13px)'
                }}>
                  Lv.{randomData.level}
                </Text>
              )}
              {randomData.location && (
                <Text style={{ 
                  display: 'block', 
                  fontSize: 'clamp(10px, 2vw, 12px)', 
                  color: '#666' 
                }}>
                  📍 {randomData.location}
                </Text>
              )}
              {randomData.description && (
                <Paragraph 
                  ellipsis={{ rows: 2 }} 
                  style={{ 
                    fontSize: 'clamp(10px, 2vw, 12px)', 
                    marginTop: 'clamp(4px, 1vw, 8px)',
                    lineHeight: '1.3'
                  }}
                >
                  {randomData.description}
                </Paragraph>
              )}
              <div style={{ 
                position: 'absolute', 
                bottom: 'clamp(8px, 2vw, 12px)', 
                left: 0, 
                right: 0,
                fontSize: 'clamp(10px, 2vw, 12px)',
                color: '#999'
              }}>
                클릭하여 더 보기 →
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 'clamp(20px, 5vw, 40px)' }}>
              <Text style={{ 
                color: '#666',
                fontSize: 'clamp(11px, 2.5vw, 13px)'
              }}>
                정보를 불러올 수 없습니다
              </Text>
            </div>
          )}
        </Card>
      </div>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};