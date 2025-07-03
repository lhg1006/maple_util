'use client';

import { useState } from 'react';
import { Row, Col, Card, Tag, Empty, Skeleton } from 'antd';
import { MapleItem } from '@/types/maplestory';

interface ItemListProps {
  items: MapleItem[];
  loading?: boolean;
  onItemClick?: (item: MapleItem) => void;
}

export const ItemList: React.FC<ItemListProps> = ({ items, loading, onItemClick }) => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [imageVersions, setImageVersions] = useState<Record<number, string>>({});

  const getItemImage = (itemId: number) => {
    // 여러 버전 시도를 위한 기본 버전
    return `https://maplestory.io/api/KMS/389/item/${itemId}/icon`;
  };
  
  const getItemImageFallback = (itemId: number, version: string = '284') => {
    return `https://maplestory.io/api/KMS/${version}/item/${itemId}/icon`;
  };

  // PC방 아이템 판별
  const isPCBang = (item: MapleItem) => {
    const name = item.name?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    return name.includes('pc방') || name.includes('pc') || 
           description.includes('pc방') || description.includes('피시방') ||
           name.includes('internet cafe') || name.includes('cafe');
  };

  // 아이템 버전 구분
  const getItemVersion = (item: MapleItem) => {
    const name = item.name || '';
    if (name.includes('테스트')) return '테스트';
    if (name.includes('(이벤트)')) return '이벤트';
    if (name.includes('(PC방)')) return 'PC방';
    if (isPCBang(item)) return 'PC방';
    return null;
  };

  // 영어 카테고리명을 한국어로 번역
  const translateCategory = (category: string) => {
    const translations: Record<string, string> = {
      'Accessory': '장신구',
      'Armor': '방어구',
      'One-Handed Weapon': '한손 무기',
      'Two-Handed Weapon': '두손 무기',
      'Secondary Weapon': '보조 무기',
      'Weapon': '무기',
      'Consumable': '소비',
      'Chair': '의자',
      'Decoration': '장식',
      'Pet': '펫',
      'Mount': '라이딩',
      'Character': '성형/헤어/피부',
      'Cash': '캐시',
      'Setup': '설치',
      'Etc': '기타',
      'Use': '소비',
      'Equip': '장비'
    };
    return translations[category] || category;
  };

  const getCategoryColor = (category: string | undefined) => {
    if (!category) return 'default';
    
    switch (category.toLowerCase()) {
      case 'equip':
      case '장비': 
        return 'blue';
      case 'use':
      case '소비': 
        return 'green';
      case 'setup':
      case '설치': 
        return 'purple';
      case 'etc':
      case '기타': 
        return 'orange';
      case 'cash':
      case '캐시': 
        return 'red';
      default: 
        return 'default';
    }
  };

  const handleImageError = (itemId: number) => {
    const versions = ['389', '284', '283', '285'];
    const currentVersion = imageVersions[itemId] || '389';
    const currentIndex = versions.indexOf(currentVersion);
    
    if (currentIndex < versions.length - 1) {
      // 다음 버전 시도
      const nextVersion = versions[currentIndex + 1];
      setImageVersions(prev => ({ ...prev, [itemId]: nextVersion }));
      console.log(`🔄 아이템 ${itemId} 이미지 버전 변경: ${currentVersion} → ${nextVersion}`);
    } else {
      // 모든 버전 실패
      setImageErrors(prev => new Set(prev).add(itemId));
      console.log(`❌ 아이템 ${itemId} 모든 이미지 버전 실패`);
    }
  };

  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 24 }).map((_, index) => (
          <Col key={index} xs={12} sm={8} md={6} lg={3} xl={3}>
            <Card
              styles={{ body: { padding: '4px' } }}
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
              }}
              cover={
                <Skeleton.Image 
                  active 
                  style={{ 
                    width: '100%', 
                    height: '100%',
                    aspectRatio: '1 / 1' 
                  }} 
                />
              }
            >
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  if (items.length === 0) {
    return <Empty description="아이템이 없습니다" />;
  }

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.id} xs={12} sm={8} md={6} lg={3} xl={3}>
          <Card
            hoverable
            className="h-full overflow-hidden"
            styles={{ body: { padding: '4px' } }}
            style={{
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              transition: 'all 0.3s ease',
              cursor: onItemClick ? 'pointer' : 'default'
            }}
            onClick={() => {
              console.log('🖱️ 아이템 클릭됨:', item.name, item.id);
              onItemClick?.(item);
            }}
            cover={
              <div 
                className="relative overflow-hidden"
                style={{ 
                  aspectRatio: '1 / 1',
                  background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {!imageErrors.has(item.id) ? (
                  <img
                    src={imageVersions[item.id] ? 
                      getItemImageFallback(item.id, imageVersions[item.id]) : 
                      (item.icon || getItemImage(item.id))
                    }
                    alt={item.name}
                    style={{ 
                      width: '60%', 
                      height: '60%', 
                      objectFit: 'contain',
                      imageRendering: 'pixelated'
                    }}
                    onError={() => handleImageError(item.id)}
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <div className="text-5xl mb-2">📦</div>
                    <div className="text-xs">이미지 없음</div>
                  </div>
                )}
                {/* 배지들 */}
                <div className="absolute top-1 right-1" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {/* Cash 배지 */}
                  {item.cash && (
                    <div 
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#FFD700',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#000',
                        border: '1px solid #FFA500',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                      }}
                      title="캐시 아이템"
                    >
                      ₩
                    </div>
                  )}
                  
                  {/* PC방 배지 */}
                  {isPCBang(item) && (
                    <div 
                      style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: '#00D2FF',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        color: '#FFF',
                        border: '1px solid #0099CC',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                      }}
                      title="PC방 전용 아이템"
                    >
                      PC
                    </div>
                  )}
                </div>
                {/* 프리미엄 펫 라벨 */}
                {item.category === 'Free Market' && 
                 item.subcategory === 'Pet' && 
                 item.description?.includes('더욱 넓은 영역의 아이템을 획득할 수 있습니다') && (
                  <div className="absolute top-2 left-2">
                    <Tag color="purple" style={{ margin: 0, fontWeight: 'bold' }}>P</Tag>
                  </div>
                )}
              </div>
            }
          >
            <Card.Meta
              title={
                <div className="text-center mb-2">
                  <div className="font-medium text-sm truncate" title={item.name}>
                    {item.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {item.category && (
                      <Tag 
                        color={getCategoryColor(item.category)} 
                        style={{ fontSize: '10px', margin: 0 }}
                      >
                        {translateCategory(item.category)}
                      </Tag>
                    )}
                    {getItemVersion(item) && (
                      <Tag 
                        color="blue" 
                        style={{ fontSize: '9px', margin: 0 }}
                      >
                        {getItemVersion(item)}
                      </Tag>
                    )}
                  </div>
                </div>
              }
              description={
                <div className="text-center">
                  {item.price ? (
                    <div className="text-xs text-yellow-600 font-semibold">
                      {item.price.toLocaleString()} 메소
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">
                      ID: {item.id}
                    </div>
                  )}
                </div>
              }
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};