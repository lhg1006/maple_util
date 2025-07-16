'use client';

import React from 'react';
import { Skeleton } from 'antd';

export function ItemDetailSkeleton() {
  return (
    <div style={{
      backgroundColor: '#2e2e2e',
      color: '#ffffff',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '600px',
      margin: '0 auto',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      border: '2px solid #5a5a5a',
    }}>
      {/* 헤더 영역 */}
      <div style={{ 
        borderBottom: '2px solid #4a4a4a', 
        paddingBottom: '16px',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        {/* 아이템 이름 스켈레톤 */}
        <Skeleton.Input 
          active 
          style={{ 
            width: 200, 
            height: 24,
            marginBottom: 8 
          }} 
        />
        {/* 카테고리 스켈레톤 */}
        <Skeleton.Input 
          active 
          style={{ 
            width: 150, 
            height: 16 
          }} 
        />
      </div>

      {/* 이미지 영역 */}
      <div style={{ 
        textAlign: 'center', 
        margin: '20px 0' 
      }}>
        <Skeleton.Image 
          active
          style={{
            width: 80,
            height: 80
          }}
        />
      </div>

      {/* 스탯 영역 */}
      <div style={{ 
        backgroundColor: '#242424',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>

      {/* 요구사항 영역 */}
      <div style={{ 
        backgroundColor: '#242424',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '16px'
      }}>
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>

      {/* 설명 영역 */}
      <div style={{ 
        backgroundColor: '#242424',
        padding: '12px',
        borderRadius: '4px'
      }}>
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    </div>
  );
}