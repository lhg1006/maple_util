'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { Modal, Spin, Button, Result } from 'antd';
import { useMapleNPC } from '@/hooks/useMapleData';
import { NPCMapleTooltip } from './npc-maple-tooltip';
import { LoadingOutlined, ReloadOutlined } from '@ant-design/icons';

interface NPCDetailModalProps {
  npcId: number | null;
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

export const NPCDetailModal: React.FC<NPCDetailModalProps> = ({ npcId, open, onClose, loading = false }) => {
  const { data: npc, isLoading, isError, error, refetch } = useMapleNPC(npcId || 0, !!npcId);
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
  }, [open, isLoading]);

  // 재시도 핸들러
  const handleRetry = useCallback(() => {
    if (npcId && refetch) {
      refetch();
    }
  }, [npcId, refetch]);

  // 디버깅 로그
  useEffect(() => {
    if (open && npcId) {
      console.log('🎯 NPCDetailModal 열림:', {
        npcId,
        isLoading,
        isError,
        error
      });
    }
  }, [open, npcId, isLoading, isError, error]);

  // 로딩 상태 처리 - 딤 배경 + 로딩바만 표시
  if (loading || isLoading) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        closable={false}
        maskClosable={false}
        styles={{
          body: { padding: 0, background: 'transparent' },
          content: { background: 'transparent', boxShadow: 'none' },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
        }}
        centered
        width={0}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center'
        }}>
          <Spin 
            size="large" 
            indicator={<LoadingOutlined style={{ fontSize: 48, color: '#FFD700' }} spin />}
          />
        </div>
      </Modal>
    );
  }

  // 에러 상태 처리
  if (isError) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={{ xs: '100vw', sm: '90vw', md: '1000px' }}
        style={{ top: 20 }}
        styles={{
          body: { padding: 0 },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
        }}
        centered
        closable={false}
        maskClosable={false}
      >
        <div ref={modalRef} style={{ background: '#2A2A4A', padding: '40px', textAlign: 'center' }}>
          <Result
            status="error"
            title={<span style={{ color: '#FFD700' }}>NPC 정보 로딩 실패</span>}
            subTitle={<span style={{ color: '#ffffff' }}>{error?.message || 'NPC 정보를 불러오는데 실패했습니다.'}</span>}
            extra={[
              <Button 
                key="retry" 
                type="primary" 
                icon={<ReloadOutlined />}
                onClick={handleRetry}
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  border: 'none',
                  color: '#000000',
                  fontWeight: 'bold'
                }}
              >
                다시 시도
              </Button>,
              <Button 
                key="close" 
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: '1px solid #FFD700',
                  color: '#FFD700'
                }}
              >
                닫기
              </Button>
            ]}
          />
        </div>
      </Modal>
    );
  }

  // 데이터 없음 상태 처리
  if (!npc) {
    return (
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        width={{ xs: '100vw', sm: '90vw', md: '1000px' }}
        style={{ top: 20 }}
        styles={{
          body: { padding: 0 },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
        }}
        centered
        closable={false}
        maskClosable={false}
      >
        <div ref={modalRef} style={{ background: '#2A2A4A', padding: '40px', textAlign: 'center' }}>
          <Result
            status="404"
            title={<span style={{ color: '#FFD700' }}>NPC를 찾을 수 없습니다</span>}
            subTitle={<span style={{ color: '#ffffff' }}>요청하신 NPC 정보가 존재하지 않습니다.</span>}
            extra={
              <Button 
                key="close" 
                onClick={onClose}
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  border: 'none',
                  color: '#000000',
                  fontWeight: 'bold'
                }}
              >
                닫기
              </Button>
            }
          />
        </div>
      </Modal>
    );
  }

  // 정상 상태 - 메이플 툴팁 표시
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={{ xs: '100vw', sm: '90vw', md: '1000px' }}
      style={{ top: 20 }}
      styles={{
        body: { 
          padding: 0,
          background: 'transparent'
        },
        content: {
          background: 'transparent',
          boxShadow: 'none'
        },
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }
      }}
      centered
      closable={false}
      maskClosable={false}
    >
      <div ref={modalRef} style={{ 
        maxHeight: '90vh', 
        overflowY: 'auto',
        background: 'transparent'
      }}>
        <NPCMapleTooltip 
          npc={npc} 
          onClose={onClose}
        />
      </div>
    </Modal>
  );
};