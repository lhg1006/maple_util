'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Modal } from 'antd';
import { MapleItem } from '@/types/maplestory';
import { useItemStats } from '@/hooks/use-item-stats';
import { ItemMapleTooltip } from './item-maple-tooltip';
import { ItemDetailSkeleton } from './item-detail-skeleton';
import { ItemErrorState } from './item-error-state';

interface ItemDetailModalProps {
  item: MapleItem | null;
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

export function ItemDetailModal({ item, open, onClose, loading = false }: ItemDetailModalProps) {
  // 화면 크기 감지
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ESC 키 및 키보드 네비게이션 처리
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'Tab':
          // Tab 키 처리는 기본적으로 브라우저가 처리하도록 둠
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // 포커스 관리
  useEffect(() => {
    if (open && modalRef.current) {
      // 모달이 열릴 때 포커스를 모달로 이동
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    }
  }, [open, loading]);

  // 장비 아이템 판별
  const isEquipment = item?.category && ['Accessory', 'Armor', 'One-Handed Weapon', 'Two-Handed Weapon', 'Secondary Weapon'].includes(item.category);
  const isCashItem = item?.cash || false;
  const hasNoStats = !item?.requirements?.level && !item?.combat?.attack && !item?.stats?.str;
  const shouldFetchStats = !!(isEquipment && !isCashItem && hasNoStats);

  // API에서 실시간 스탯 정보 가져오기
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
    retry: retryStats
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
      width={isMobile ? '100vw' : 1000}
      height={isMobile ? '100vh' : 'auto'}
      centered={!isMobile}
      closable={false}
      destroyOnHidden
      aria-labelledby="item-modal-title"
      aria-describedby="item-modal-description"
      role="dialog"
      aria-modal="true"
      styles={{
        body: { 
          padding: isMobile ? '10px' : 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'transparent',
          height: isMobile ? '100vh' : 'auto',
          overflow: isMobile ? 'auto' : 'visible'
        },
        content: { 
          padding: 0,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          maxWidth: isMobile ? '100vw' : '1000px',
          height: isMobile ? '100vh' : 'auto',
          borderRadius: isMobile ? 0 : '8px'
        },
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.85)' }
      }}
    >
      <div ref={modalRef} tabIndex={-1}>
      {(loading || isLoadingStats) ? (
        <ItemDetailSkeleton onClose={onClose} />
      ) : statsError ? (
        <ItemErrorState
          onRetry={retryStats}
          message={`아이템 "${item?.name || 'Unknown'}"의 상세 정보를 불러올 수 없습니다.`}
          title="데이터 로딩 실패"
        />
      ) : (
        <ItemMapleTooltip 
          item={enhancedItem} 
          stats={statsData}
          onClose={onClose}
        />
      )}
      </div>
    </Modal>
  );
}