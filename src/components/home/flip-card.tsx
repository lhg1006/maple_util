'use client';

import { Card, Typography } from 'antd';
import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';
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
    if (isFlipped && !randomData && !isLoading) {
      fetchFixedData();
    }
  }, [isFlipped]);

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
          }}
        >
          <div style={{ fontSize: '48px', color, marginBottom: '16px' }}>
            {icon}
          </div>
          <Title level={4}>{title}</Title>
          <Paragraph style={{ marginTop: '16px' }}>
            {description}
          </Paragraph>
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
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading-spinner" style={{
                width: '40px',
                height: '40px',
                border: `3px solid ${color}30`,
                borderTop: `3px solid ${color}`,
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite',
              }} />
              <Text style={{ display: 'block', marginTop: '16px', color: '#666' }}>
                정보를 불러오는 중...
              </Text>
            </div>
          ) : randomData ? (
            <div style={{ textAlign: 'center' }}>
              {randomData.image && (
                <div style={{ 
                  height: '80px', 
                  marginBottom: '16px',
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
              <Title level={5} style={{ color, marginBottom: '8px' }}>
                {randomData.name}
              </Title>
              {randomData.level && (
                <Text style={{ display: 'block', marginBottom: '4px' }}>
                  Lv.{randomData.level}
                </Text>
              )}
              {randomData.location && (
                <Text style={{ display: 'block', fontSize: '12px', color: '#666' }}>
                  📍 {randomData.location}
                </Text>
              )}
              {randomData.description && (
                <Paragraph 
                  ellipsis={{ rows: 2 }} 
                  style={{ fontSize: '12px', marginTop: '8px' }}
                >
                  {randomData.description}
                </Paragraph>
              )}
              <div style={{ 
                position: 'absolute', 
                bottom: '12px', 
                left: 0, 
                right: 0,
                fontSize: '12px',
                color: '#999'
              }}>
                클릭하여 더 보기 →
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text style={{ color: '#666' }}>
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