'use client';

import React from 'react';
import { Skeleton } from 'antd';

interface ItemDetailSkeletonProps {
  onClose?: () => void;
}

export function ItemDetailSkeleton({ onClose }: ItemDetailSkeletonProps) {
  return (
    <div className="maple-tooltip">
      {/* 아이템 이름 (상단) */}
      <div className="maple-tooltip-name stat-rare">
        <Skeleton.Input 
          active 
          style={{ width: 180, height: 20, backgroundColor: 'rgba(255,255,255,0.2)' }} 
        />
        {onClose && (
          <button 
            onClick={onClose}
            className="maple-tooltip-close-btn"
            aria-label="닫기"
          >
            ✕
          </button>
        )}
      </div>

      {/* 아이템 상세 정보 박스 */}
      <div className="maple-tooltip-detail-box">
        {/* 좌측: 아이템 아이콘 */}
        <div className="maple-tooltip-icon-section">
          <div className="maple-tooltip-icon" style={{ position: 'relative' }}>
            <Skeleton.Image 
              active
              style={{ width: 80, height: 80 }}
            />
          </div>
        </div>

        {/* 우측: 스탯 정보 */}
        <div className="maple-tooltip-stats-section">
          {/* 요구사항 스켈레톤 */}
          <div className="maple-tooltip-req">
            <Skeleton.Input active style={{ width: 120, height: 14 }} />
          </div>
          <div className="maple-tooltip-req">
            <Skeleton.Input active style={{ width: 100, height: 14 }} />
          </div>
          <div className="maple-tooltip-req">
            <Skeleton.Input active style={{ width: 110, height: 14 }} />
          </div>
          <div className="maple-tooltip-req">
            <Skeleton.Input active style={{ width: 90, height: 14 }} />
          </div>
          <div className="maple-tooltip-req">
            <Skeleton.Input active style={{ width: 105, height: 14 }} />
          </div>
        </div>
      </div>

      {/* 구분선 */}
      <div className="maple-tooltip-divider"></div>
      
      {/* 하단 스탯 영역 */}
      <div className="maple-tooltip-bottom-stats">
        <div className="maple-tooltip-stat">
          <Skeleton.Input active style={{ width: 140, height: 14 }} />
        </div>
        <div className="maple-tooltip-stat">
          <Skeleton.Input active style={{ width: 120, height: 14 }} />
        </div>
        <div className="maple-tooltip-stat">
          <Skeleton.Input active style={{ width: 110, height: 14 }} />
        </div>
        <div className="maple-tooltip-stat">
          <Skeleton.Input active style={{ width: 130, height: 14 }} />
        </div>
        <div className="maple-tooltip-stat">
          <Skeleton.Input active style={{ width: 100, height: 14 }} />
        </div>
        <div className="maple-tooltip-stat">
          <Skeleton.Input active style={{ width: 115, height: 14 }} />
        </div>
      </div>

      {/* 업그레이드 정보 */}
      <div className="maple-tooltip-upgrade">
        <Skeleton.Input active style={{ width: 150, height: 14 }} />
      </div>

      {/* 설명 영역 */}
      <div className="maple-tooltip-description">
        <Skeleton 
          active 
          paragraph={{ rows: 2, width: ['100%', '85%'] }}
          title={false}
        />
      </div>

      {/* 가격 영역 */}
      <div className="maple-tooltip-price" style={{ textAlign: 'center', marginTop: '10px' }}>
        <Skeleton.Input active style={{ width: 80, height: 16 }} />
      </div>
    </div>
  );
}