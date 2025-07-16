'use client';

import React from 'react';
import { Skeleton } from 'antd';

export function ItemDetailSkeleton() {
  return (
    <div className="maple-tooltip">
      {/* 닫기 버튼 영역 */}
      <div style={{ textAlign: 'right', marginBottom: '10px' }}>
        <Skeleton.Button 
          active 
          size="small"
          style={{ width: 30, height: 30 }}
        />
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
          <div style={{ marginBottom: '8px' }}>
            <Skeleton.Input active style={{ width: 120, height: 16 }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Skeleton.Input active style={{ width: 100, height: 16 }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Skeleton.Input active style={{ width: 110, height: 16 }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <Skeleton.Input active style={{ width: 90, height: 16 }} />
          </div>

          {/* 구분선 */}
          <div className="maple-tooltip-divider" style={{ margin: '12px 0' }}></div>

          {/* 하단 스탯 영역 */}
          <div className="maple-tooltip-bottom-stats">
            <div style={{ marginBottom: '6px' }}>
              <Skeleton.Input active style={{ width: 150, height: 16 }} />
            </div>
            <div style={{ marginBottom: '6px' }}>
              <Skeleton.Input active style={{ width: 130, height: 16 }} />
            </div>
            <div style={{ marginBottom: '6px' }}>
              <Skeleton.Input active style={{ width: 140, height: 16 }} />
            </div>
            <div style={{ marginBottom: '6px' }}>
              <Skeleton.Input active style={{ width: 120, height: 16 }} />
            </div>
          </div>
        </div>
      </div>

      {/* 설명 영역 */}
      <div 
        className="maple-tooltip-description"
        style={{
          marginTop: '15px',
          padding: '10px',
          borderTop: '1px solid #333'
        }}
      >
        <Skeleton 
          active 
          paragraph={{ rows: 3, width: ['100%', '90%', '75%'] }}
          title={false}
        />
      </div>

      {/* 가격 영역 */}
      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <Skeleton.Input active style={{ width: 100, height: 20 }} />
      </div>
    </div>
  );
}