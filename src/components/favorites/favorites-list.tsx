'use client';

import React, { useState, useEffect } from 'react';
import { Card, List, Typography, Empty, Button, Space, Tag, Avatar, Tooltip } from 'antd';
import { 
  HeartOutlined, 
  ShoppingOutlined, 
  UserOutlined, 
  BugOutlined, 
  TeamOutlined, 
  ThunderboltOutlined,
  DeleteOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { useFavorites, FavoriteItem } from '@/hooks/useFavorites';
import { useRouter } from 'next/navigation';
import { FavoriteDetailModal } from './favorite-detail-modal';

const { Title, Text } = Typography;

const typeIcons = {
  item: <ShoppingOutlined />,
  npc: <UserOutlined />,
  mob: <BugOutlined />,
  job: <TeamOutlined />,
  skill: <ThunderboltOutlined />,
};

const typeLabels = {
  item: '아이템',
  npc: 'NPC',
  mob: '몬스터',
  job: '직업',
  skill: '스킬',
};

const typeColors = {
  item: '#52c41a',
  npc: '#1890ff',
  mob: '#722ed1',
  job: '#fa8c16',
  skill: '#eb2f96',
};

interface FavoritesListProps {
  type?: 'item' | 'npc' | 'mob' | 'job' | 'skill';
  showHeader?: boolean;
  maxItems?: number;
}

export function FavoritesList({ type, showHeader = true, maxItems }: FavoritesListProps) {
  const { favorites, removeFavorite, clearAllFavorites } = useFavorites();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 클라이언트에서만 실행되도록 하여 hydration 에러 방지
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 타입별 필터링
  const filteredFavorites = type 
    ? favorites.filter(fav => fav.type === type)
    : favorites;

  // 최대 개수 제한
  const displayFavorites = maxItems 
    ? filteredFavorites.slice(0, maxItems)
    : filteredFavorites;

  const handleItemClick = (favorite: FavoriteItem) => {
    setSelectedFavorite(favorite);
    setModalOpen(true);
  };

  const handleRemove = (favorite: FavoriteItem, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFavorite(favorite.id, favorite.type);
  };

  const handleClearAll = async () => {
    setLoading(true);
    try {
      clearAllFavorites();
    } finally {
      setLoading(false);
    }
  };

  if (displayFavorites.length === 0) {
    return (
      <Card>
        {showHeader && (
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>
              <HeartOutlined /> 즐겨찾기
            </Title>
          </div>
        )}
        <Empty
          image={<HeartOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
          description={
            <div>
              <Text type="secondary">즐겨찾기한 항목이 없습니다</Text>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                하트 버튼을 클릭하여 즐겨찾기를 추가해보세요
              </Text>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 16 
        }}>
          <Title level={4} style={{ margin: 0 }}>
            <HeartOutlined /> 즐겨찾기 ({displayFavorites.length})
          </Title>
          {!type && favorites.length > 0 && (
            <Button
              type="text"
              size="small"
              icon={<ClearOutlined />}
              onClick={handleClearAll}
              loading={loading}
              danger
            >
              전체 삭제
            </Button>
          )}
        </div>
      )}

      <List
        dataSource={displayFavorites}
        renderItem={(favorite) => (
          <List.Item
            style={{ cursor: 'pointer', padding: '8px 0' }}
            onClick={() => handleItemClick(favorite)}
            actions={[
              <Tooltip title="즐겨찾기에서 제거" key="remove">
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => handleRemove(favorite, e)}
                  danger
                />
              </Tooltip>
            ]}
          >
            <List.Item.Meta
              avatar={
                favorite.icon ? (
                  <Avatar 
                    src={favorite.icon} 
                    size="small"
                    style={{ backgroundColor: typeColors[favorite.type] }}
                  />
                ) : (
                  <Avatar 
                    icon={typeIcons[favorite.type]} 
                    size="small"
                    style={{ backgroundColor: typeColors[favorite.type] }}
                  />
                )
              }
              title={
                <Space>
                  <Text strong>{favorite.name}</Text>
                  <Tag 
                    color={typeColors[favorite.type]}
                  >
                    {typeLabels[favorite.type]}
                  </Tag>
                </Space>
              }
              description={
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {isMounted ? new Date(favorite.addedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '로딩 중...'}
                </Text>
              }
            />
          </List.Item>
        )}
      />

      {maxItems && filteredFavorites.length > maxItems && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button 
            type="link" 
            onClick={() => router.push('/favorites')}
          >
            더 보기 ({filteredFavorites.length - maxItems}개 더)
          </Button>
        </div>
      )}

      <FavoriteDetailModal
        favorite={selectedFavorite}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedFavorite(null);
        }}
      />
    </Card>
  );
}