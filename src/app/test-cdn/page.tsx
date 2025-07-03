'use client';

import { useState, useEffect } from 'react';
import { loadItems, loadMonsters, loadMaps } from '@/lib/cdn-data-loader';
import { Button, Card, Typography, Spin, Alert } from 'antd';

const { Title, Paragraph, Text } = Typography;

export default function TestCDNPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({});
  const [error, setError] = useState<string | null>(null);

  const testCDN = async () => {
    setLoading(true);
    setError(null);
    setResults({});

    try {
      console.log('🧪 CDN 테스트 시작...');
      
      // 몬스터 데이터 테스트
      console.log('👾 몬스터 데이터 로딩...');
      const monsters = await loadMonsters();
      const monsterCount = Object.keys(monsters).length;
      const sampleMonster = Object.values(monsters)[0] as any;
      
      // 아이템 데이터 테스트
      console.log('📦 아이템 데이터 로딩...');
      const items = await loadItems();
      const itemCount = Object.keys(items).length;
      const sampleItem = Object.values(items)[0] as any;
      
      // 카테고리 분포 확인
      const categoryCount: Record<string, number> = {};
      Object.values(items).slice(0, 1000).forEach((item: any) => {
        const category = item.typeInfo?.overallCategory || 'Unknown';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
      });
      
      // 맵 데이터 테스트
      console.log('🗺️ 맵 데이터 로딩...');
      const maps = await loadMaps();
      const mapCount = Object.keys(maps).length;
      const sampleMap = Object.values(maps)[0] as any;
      
      setResults({
        monsters: {
          count: monsterCount,
          sample: sampleMonster
        },
        items: {
          count: itemCount,
          sample: sampleItem,
          categories: categoryCount
        },
        maps: {
          count: mapCount,
          sample: sampleMap
        }
      });
      
      console.log('✅ 모든 CDN 테스트 완료!');
      
    } catch (err: any) {
      console.error('❌ CDN 테스트 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>CDN 데이터 로딩 테스트</Title>
      <Paragraph>
        별도 GitHub 레포지토리의 CDN 데이터가 정상적으로 로딩되는지 테스트합니다.
      </Paragraph>
      
      <Button 
        type="primary" 
        onClick={testCDN} 
        loading={loading}
        size="large"
        style={{ marginBottom: '24px' }}
      >
        CDN 테스트 실행
      </Button>
      
      {error && (
        <Alert
          message="테스트 실패"
          description={error}
          type="error"
          style={{ marginBottom: '24px' }}
        />
      )}
      
      {loading && (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" spinning={true} tip="CDN에서 데이터를 로딩 중...">
            <div style={{ minHeight: '100px' }} />
          </Spin>
        </div>
      )}
      
      {results.monsters && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <Card title="몬스터 데이터" size="small">
            <Text strong>총 개수:</Text> {results.monsters.count.toLocaleString()}개<br/>
            <Text strong>샘플:</Text> {results.monsters.sample?.name} (Lv.{results.monsters.sample?.level})
          </Card>
          
          <Card title="아이템 데이터" size="small">
            <Text strong>총 개수:</Text> {results.items.count.toLocaleString()}개<br/>
            <Text strong>샘플:</Text> {results.items.sample?.name}<br/>
            <Text strong>카테고리:</Text> {results.items.sample?.typeInfo?.overallCategory}
            
            <div style={{ marginTop: '12px' }}>
              <Text strong>카테고리 분포 (샘플 1000개):</Text>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                {Object.entries(results.items.categories || {}).map(([cat, count]) => (
                  <li key={cat}>{cat}: {count as number}개</li>
                ))}
              </ul>
            </div>
          </Card>
          
          <Card title="맵 데이터" size="small">
            <Text strong>총 개수:</Text> {results.maps.count.toLocaleString()}개<br/>
            <Text strong>샘플:</Text> {results.maps.sample?.name}<br/>
            <Text strong>지역:</Text> {results.maps.sample?.streetName}
          </Card>
        </div>
      )}
      
      {results.monsters && (
        <Alert
          message="CDN 테스트 성공!"
          description="모든 데이터가 정상적으로 로딩되었습니다. 이제 아이템 페이지와 몬스터 페이지에서 완전한 데이터를 사용할 수 있습니다."
          type="success"
          style={{ marginTop: '24px' }}
        />
      )}
    </div>
  );
}