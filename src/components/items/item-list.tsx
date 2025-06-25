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
    // 여러 버전 시도
    const versions = ['210.1.1', '208.2.0', '207.0.0'];
    const version = versions[0]; // 기본 버전
    return `https://maplestory.io/api/GMS/${version}/item/${itemId}/icon`;
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
        {Array.from({ length: 8 }).map((_, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            <Card>
              <Skeleton active />
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
        <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
          <Card
            hoverable
            className="h-full"
            cover={
              <div className="flex items-center justify-center p-4 bg-gray-50" style={{ height: '120px' }}>
                {!imageErrors.has(item.id) ? (
                  <img
                    src={getItemImage(item.id)}
                    alt={item.name}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                    onError={() => handleImageError(item.id)}
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <div className="text-xs">이미지 없음</div>
                  </div>
                )}
              </div>
            }
          >
            <Card.Meta
              title={
                <div className="flex items-center justify-between">
                  <span className="truncate" title={item.name}>
                    {item.name}
                  </span>
                  {item.category && (
                    <Tag color={getCategoryColor(item.category)} size="small">
                      {item.category}
                    </Tag>
                  )}
                </div>
              }
              description={
                <div className="space-y-2">
                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-2" title={item.description}>
                      {item.description}
                    </p>
                  )}
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>ID: {item.id}</span>
                    {item.price && (
                      <span className="text-yellow-600">
                        {item.price.toLocaleString()} 메소
                      </span>
                    )}
                  </div>
                </div>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};