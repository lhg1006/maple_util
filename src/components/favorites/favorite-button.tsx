'use client';

import React from 'react';
import { Button, Tooltip } from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useFavorites, FavoriteItem } from '@/hooks/useFavorites';

interface FavoriteButtonProps {
  item: Omit<FavoriteItem, 'addedAt'>;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'dashed' | 'link' | 'text';
  showText?: boolean;
}

export function FavoriteButton({ 
  item, 
  size = 'middle', 
  type = 'default',
  showText = false 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(item.id, item.type);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    toggleFavorite(item);
  };

  return (
    <Tooltip title={favorite ? '즐겨찾기에서 제거' : '즐겨찾기에 추가'}>
      <Button
        type={type}
        size={size}
        icon={favorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        {showText && (favorite ? '즐겨찾기 해제' : '즐겨찾기')}
      </Button>
    </Tooltip>
  );
}