'use client';

import React, { memo, useCallback } from 'react';
import { Row, Col, Empty, Skeleton } from 'antd';
import { MapleItem } from '@/types/maplestory';
import { ItemCard } from './item-card';

interface ItemListProps {
  items: MapleItem[];
  loading?: boolean;
  onItemClick?: (item: MapleItem) => void;
}

// React.memo로 최적화된 ItemList 컴포넌트
const ItemList = memo<ItemListProps>(({ items, loading, onItemClick }) => {
  // onItemClick을 useCallback으로 최적화
  const handleItemClick = useCallback((item: MapleItem) => {
    console.log('🖱️ 아이템 클릭됨:', item.name, item.id);
    onItemClick?.(item);
  }, [onItemClick]);

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 24 }).map((_, index) => (
          <Col key={index} xs={12} sm={8} md={6} lg={3} xl={3}>
            <div style={{ aspectRatio: '1 / 1' }}>
              <Skeleton.Image 
                active 
                style={{ 
                  width: '100%', 
                  height: '100%',
                }} 
              />
              <Skeleton active paragraph={{ rows: 1 }} style={{ marginTop: '8px' }} />
            </div>
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
          <ItemCard 
            item={item} 
            onItemClick={handleItemClick}
          />
        </Col>
      ))}
    </Row>
  );
});

// displayName 설정 (디버깅용)
ItemList.displayName = 'ItemList';

export { ItemList };