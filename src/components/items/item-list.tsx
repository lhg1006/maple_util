'use client';

import { useState, useEffect } from 'react';
import { Row, Col, Card, Tag, Empty, Skeleton } from 'antd';
import { MapleItem } from '@/types/maplestory';

interface ItemListProps {
  items: MapleItem[];
  loading?: boolean;
}

export const ItemList: React.FC<ItemListProps> = ({ items, loading }) => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const getItemImage = (itemId: number) => {
    // KMS 389 버전 사용 (데이터와 일치)
    return `https://maplestory.io/api/KMS/389/item/${itemId}/icon`;
  };

  const getCategoryColor = (category: string | undefined) => {
    if (!category) return 'default';
    
    switch (category.toLowerCase()) {
      case 'equip':
      case '장비': 
        return 'blue';
      case 'use':
      case '소비': 
        return 'green';
      case 'setup':
      case '설치': 
        return 'purple';
      case 'etc':
      case '기타': 
        return 'orange';
      case 'cash':
      case '캐시': 
        return 'red';
      default: 
        return 'default';
    }
  };

  const handleImageError = (itemId: number) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 24 }).map((_, index) => (
          <Col key={index} xs={12} sm={8} md={6} lg={3} xl={3}>
            <Card
              styles={{ body: { padding: '4px' } }}
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              cover={
                <Skeleton.Image 
                  active 
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    aspectRatio: '1 / 1' 
                  }} 
                />
              }
            >
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (items.length === 0) {
    return <Empty description="아이템이 없습니다" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.id} xs={12} sm={8} md={6} lg={3} xl={3}>
          <Card
            hoverable
            className="h-full overflow-hidden"
            styles={{ body: { padding: '4px' } }}
            style={{
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease'
            }}
            cover={
              <div 
                className="relative overflow-hidden"
                style={{ 
                  aspectRatio: '1 / 1',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!imageErrors.has(item.id) ? (
                  <img
                    src={item.icon || getItemImage(item.id)}
                    alt={item.name}
                    style={{ 
                      width: '60%', 
                      height: '60%', 
                      objectFit: 'contain',
                      imageRendering: 'pixelated'
                    }}
                    onError={() => handleImageError(item.id)}
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-5xl mb-2">📦</div>
                    <div className="text-xs">이미지 없음</div>
                  </div>
                )}
                {item.cash && (
                  <div className="absolute top-2 right-2">
                    <Tag color="red" style={{ margin: 0 }}>캐시</Tag>
                  </div>
                )}
              </div>
            }
          >
            <Card.Meta
              title={
                <div className="text-center mb-2">
                  <div className="font-medium text-sm truncate" title={item.name}>
                    {item.name}
                  </div>
                  {item.category && (
                    <Tag 
                      color={getCategoryColor(item.category)} 
                      size="small"
                      style={{ fontSize: '10px', marginTop: '4px' }}
                    >
                      {item.category}
                    </Tag>
                  )}
                </div>
              }
              description={
                <div className="text-center">
                  {item.price ? (
                    <div className="text-xs text-yellow-600 font-semibold">
                      {item.price.toLocaleString()} 메소
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">
                      ID: {item.id}
                    </div>
                  )}
                </div>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};