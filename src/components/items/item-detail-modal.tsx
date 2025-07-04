'use client';

import React, { useEffect } from 'react';
import { Modal, Spin } from 'antd';
import { MapleItem } from '@/types/maplestory';
import { useItemStats } from '@/hooks/use-item-stats';
import { ItemMapleTooltip } from './item-maple-tooltip';
import { LoadingOutlined } from '@ant-design/icons';

interface ItemDetailModalProps {
  item: MapleItem | null;
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

export function ItemDetailModal({ item, open, onClose, loading = false }: ItemDetailModalProps) {
  // 장비 아이템 판별
  const isEquipment = item?.category && ['Accessory', 'Armor', 'One-Handed Weapon', 'Two-Handed Weapon', 'Secondary Weapon'].includes(item.category);
  const isCashItem = item?.cash || false;
  const hasNoStats = !item?.requirements?.level && !item?.combat?.attack && !item?.stats?.str;
  const shouldFetchStats = !!(isEquipment && !isCashItem && hasNoStats);

  // API에서 실시간 스탯 정보 가져오기
  const {
    data: statsData,
    isLoading: isLoadingStats
  } = useItemStats(item?.id || 0, shouldFetchStats);

  // 디버깅 로그
  useEffect(() => {
    if (open && item) {
      console.log('🎯 ItemDetailModal 열림:', {
        itemId: item.id,
        itemName: item.name,
        isEquipment,
        isCashItem,
        hasNoStats,
        shouldFetchStats
      });
    }
  }, [open, item, isEquipment, isCashItem, hasNoStats, shouldFetchStats]);

  // 향상된 아이템 데이터 계산 (API 데이터 병합)
  const enhancedItem = React.useMemo(() => {
    if (!item) return null;
    
    const result = { ...item };
    
    // API에서 가져온 스탯 데이터 병합
    if (statsData) {
      console.log(`🔄 API 데이터 병합 for item ${item.id}:`, statsData);
      
      if (statsData.requirements) {
        result.requirements = statsData.requirements;
      }
      
      if (statsData.combat) {
        result.combat = statsData.combat;
      }
      
      if (statsData.stats) {
        result.stats = statsData.stats;
      }
      
      if (statsData.enhancement) {
        result.enhancement = statsData.enhancement;
      }
      
      if (statsData.weapon) {
        result.weapon = statsData.weapon;
      }
    }
    
    return result;
  }, [item, statsData]);

  if (!item || !enhancedItem) return null;

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      centered
      closable={false}
      styles={{
        body: { 
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'transparent'
        },
        content: { 
          padding: 0,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none'
        },
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.85)' }
      }}
    >
      {(loading || isLoadingStats) ? (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
          <div style={{ marginTop: '12px', color: '#666' }}>
            아이템 정보를 불러오는 중...
          </div>
        </div>
      ) : (
        <ItemMapleTooltip 
          item={enhancedItem} 
          stats={statsData}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}