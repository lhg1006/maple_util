'use client';

import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Modal, Spin, Button, Result } from 'antd';
import { MapleItem } from '@/types/maplestory';
import { useItemStats } from '@/hooks/use-item-stats';
import { ItemMapleTooltip } from './item-maple-tooltip';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

interface ItemDetailModalProps {
  item: MapleItem | null;
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

export function ItemDetailModal({ item, open, onClose, loading = false }: ItemDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

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

  // ESC 키로 모달 닫기
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && open) {
      onClose();
    }
  }, [open, onClose]);

  // 키보드 이벤트 리스너 추가
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    retryStats();
  }, [retryStats]);

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

  // 반응형 모달 설정
  const getModalProps = () => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth <= 1024;
      
      if (isMobile) {
        return {
          width: '100vw',
          height: '100vh',
          style: { top: 0, margin: 0, maxWidth: '100vw' },
          centered: false,
        };
      } else if (isTablet) {
        return {
          width: '90vw',
          centered: true,
        };
      } else {
        return {
          width: 1000,
          centered: true,
        };
      }
    }
    return { width: 1000, centered: true };
  };

  const modalProps = getModalProps();

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      {...modalProps}
      closable={true}
      destroyOnHidden={true}
      keyboard={true} // ESC 키 지원
      focusTriggerAfterClose={false}
      styles={{
        body: { 
          padding: typeof window !== 'undefined' && window.innerWidth <= 768 ? '10px' : 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'transparent',
          minHeight: typeof window !== 'undefined' && window.innerWidth <= 768 ? '100vh' : 'auto',
          overflow: typeof window !== 'undefined' && window.innerWidth <= 768 ? 'auto' : 'visible'
        },
        content: { 
          padding: 0,
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          maxWidth: typeof window !== 'undefined' && window.innerWidth <= 768 ? '100vw' : '1000px',
          height: typeof window !== 'undefined' && window.innerWidth <= 768 ? '100vh' : 'auto',
          borderRadius: typeof window !== 'undefined' && window.innerWidth <= 768 ? 0 : '8px'
        },
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.85)' }
      }}
    >
      <div ref={modalRef} tabIndex={-1}>
      {(loading || isLoadingStats) ? (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '60px 40px',
          color: '#ffffff'
        }}>
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#1890ff' }} spin />} 
            size="large"
          />
          <div style={{ 
            marginTop: '20px', 
            fontSize: '16px',
            fontWeight: '500'
          }}>
            아이템 정보를 불러오는 중...
          </div>
          <div style={{ 
            marginTop: '8px', 
            fontSize: '14px',
            color: '#999',
            textAlign: 'center'
          }}>
            {item?.name && `"${item.name}" 상세 정보 로딩`}
          </div>
        </div>
      ) : statsError ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          <Result
            status="error"
            title="아이템 정보를 불러올 수 없습니다"
            subTitle="네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요."
            extra={[
              <Button 
                key="retry" 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={handleRetry}
              >
                다시 시도
              </Button>,
              <Button key="close" onClick={onClose}>
                닫기
              </Button>
            ]}
            style={{ 
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '8px'
            }}
          />
        </div>
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