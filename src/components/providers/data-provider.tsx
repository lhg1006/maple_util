'use client';

import React, { useEffect, useState } from 'react';
import { Spin, Alert, Typography } from 'antd';
import { useDataStore } from '@/stores/useDataStore';

const { Title, Text } = Typography;

interface DataProviderProps {
  children: React.ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const { 
    isLoading, 
    error, 
    monstersLoaded, 
    itemsLoaded, 
    mapsLoaded, 
    npcsLoaded,
    loadAllData,
    getStats
  } = useDataStore();
  
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // 앱 시작 시 모든 데이터 로드
  useEffect(() => {
    if (!hasInitialized) {
      console.log('🔄 DataProvider: 초기 데이터 로딩 시작');
      loadAllData();
      setHasInitialized(true);
    }
  }, [hasInitialized, loadAllData]);
  
  // 로딩 중일 때
  if (isLoading || !monstersLoaded || !itemsLoaded || !mapsLoaded || !npcsLoaded) {
    const stats = getStats();
    
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '0 24px' }}>
          <Title level={2} style={{ color: 'white', marginBottom: '24px' }}>
            🍁 메이플스토리 유틸리티
          </Title>
          
          <Spin size="large" style={{ marginBottom: '24px' }} />
          
          <Title level={4} style={{ color: 'white', fontWeight: 400 }}>
            데이터를 불러오는 중...
          </Title>
          
          <div style={{ 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '8px', 
            padding: '16px',
            marginTop: '24px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                ✅ 몬스터: {monstersLoaded ? `${stats.monsters.toLocaleString()}개` : '로딩 중...'}
              </Text>
            </div>
            <div style={{ marginBottom: '8px' }}>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                ✅ 아이템: {itemsLoaded ? `${stats.items.toLocaleString()}개` : '로딩 중...'}
              </Text>
            </div>
            <div>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                ✅ 맵: {mapsLoaded ? `${stats.maps.toLocaleString()}개` : '로딩 중...'}
              </Text>
            </div>
            <div>
              <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                ✅ NPC: {npcsLoaded ? `${stats.npcs.toLocaleString()}개` : '로딩 중...'}
              </Text>
            </div>
          </div>
          
          <Text style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '12px',
            marginTop: '16px',
            display: 'block'
          }}>
            최초 로딩 후 모든 데이터를 캐시하여 빠른 탐색이 가능합니다
          </Text>
        </div>
      </div>
    );
  }
  
  // 에러 발생 시
  if (error) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '24px'
      }}>
        <Alert
          message="데이터 로딩 실패"
          description={error}
          type="error"
          showIcon
          action={
            <button 
              onClick={() => {
                setHasInitialized(false);
                window.location.reload();
              }}
              style={{
                background: '#ff4d4f',
                color: 'white',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              다시 시도
            </button>
          }
        />
      </div>
    );
  }
  
  // 데이터 로딩 완료 후 앱 렌더링
  return <>{children}</>;
};