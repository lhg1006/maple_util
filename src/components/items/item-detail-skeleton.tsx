'use client';

import React from 'react';
import { Skeleton } from 'antd';

export function ItemDetailSkeleton() {
  return (
    <div className="maple-tooltip">
      {/* 아이템 이름 (상단) */}
      <div className="maple-tooltip-name stat-rare">
        <Skeleton.Input 
          active 
          style={{ width: 200, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' }} 
        />
        <button className="maple-tooltip-close-btn" aria-label="닫기">
          ✕
        </button>
      </div>

      {/* 아이템 상세 정보 박스 */}
      <div className="maple-tooltip-detail-box">
        {/* 좌측: 아이템 아이콘 */}
        <div className="maple-tooltip-icon-section">
          <Skeleton.Image 
            active
            style={{ width: 80, height: 80 }}
          />
        </div>

        {/* 우측: 스탯 정보 */}
        <div className="maple-tooltip-stats-section">
          {/* 요구사항 스켈레톤 */}
          <div className="maple-tooltip-req">
            <Skeleton.Input active style={{ width: 120, height: 16 }} />
          </div>
          <div className="maple-tooltip-req">
            <Skeleton.Input active style={{ width: 100, height: 16 }} />
          </div>
          <div className="maple-tooltip-req">
            <Skeleton.Input active style={{ width: 110, height: 16 }} />
          </div>
          <div className="maple-tooltip-req">
            <Skeleton.Input active style={{ width: 90, height: 16 }} />
          </div>

          {/* 구분선 */}
          <div className="maple-tooltip-divider"></div>

          {/* 하단 스탯 영역 */}
          <div className="maple-tooltip-bottom-stats">
            <div className="maple-tooltip-stat">
              <Skeleton.Input active style={{ width: 150, height: 16 }} />
            </div>
            <div className="maple-tooltip-stat">
              <Skeleton.Input active style={{ width: 130, height: 16 }} />
            </div>
            <div className="maple-tooltip-stat">
              <Skeleton.Input active style={{ width: 140, height: 16 }} />
            </div>
            <div className="maple-tooltip-stat">
              <Skeleton.Input active style={{ width: 120, height: 16 }} />
            </div>
          </div>
        </div>
      </div>

      {/* 설명 영역 */}
      <div className="maple-tooltip-description">
        <Skeleton 
          active 
          paragraph={{ rows: 3, width: ['100%', '90%', '75%'] }}
          title={false}
        />
      </div>
    </div>
  );
}