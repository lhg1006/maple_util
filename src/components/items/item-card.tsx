'use client';

import React, { useState, useCallback, memo } from 'react';
import { Card, Tag } from 'antd';
import { MapleItem } from '@/types/maplestory';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { useTheme } from '@/components/providers/theme-provider';

interface ItemCardProps {
  item: MapleItem;
  onItemClick?: (item: MapleItem) => void;
}

// 아이템 카드 컴포넌트를 React.memo로 최적화
const ItemCard = memo<ItemCardProps>(({ item, onItemClick }) => {
  const { theme: currentTheme } = useTheme();
  const [imageError, setImageError] = useState(false);
  const [imageVersion, setImageVersion] = useState('389');

  const getItemImage = useCallback((itemId: number) => {
    return `https://maplestory.io/api/KMS/389/item/${itemId}/icon`;
  }, []);
  
  const getItemImageFallback = useCallback((itemId: number, version: string = '284') => {
    return `https://maplestory.io/api/KMS/${version}/item/${itemId}/icon`;
  }, []);

  // PC방 아이템 판별 - 메모이제이션
  const isPCBang = useCallback((item: MapleItem) => {
    const name = item.name?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    return name.includes('pc방') || name.includes('pc') || 
           description.includes('pc방') || description.includes('피시방') ||
           name.includes('internet cafe') || name.includes('cafe');
  }, []);

  // 아이템 버전 구분 - 메모이제이션
  const getItemVersion = useCallback((item: MapleItem) => {
    const name = item.name || '';
    if (name.includes('테스트')) return '테스트';
    if (name.includes('(이벤트)')) return '이벤트';
    if (name.includes('(PC방)')) return 'PC방';
    if (isPCBang(item)) return 'PC방';
    return null;
  }, [isPCBang]);

  // 영어 카테고리명을 한국어로 번역 - 메모이제이션
  const translateCategory = useCallback((category: string) => {
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
  }, []);

  const getCategoryColor = useCallback((category: string | undefined) => {
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
        return 'gold';
      case 'cash':
      case '캐시': 
        return 'red';
      default: 
        return 'default';
    }
  }, []);

  const handleImageError = useCallback(() => {
    const versions = ['389', '284', '283', '285'];
    const currentIndex = versions.indexOf(imageVersion);
    
    if (currentIndex < versions.length - 1) {
      // 다음 버전 시도
      const nextVersion = versions[currentIndex + 1];
      setImageVersion(nextVersion);
    } else {
      // 모든 버전 실패
      setImageError(true);
    }
  }, [imageVersion]);

  const handleCardClick = useCallback(() => {
    onItemClick?.(item);
  }, [item, onItemClick]);

  return (
    <Card
      hoverable
      className="h-full overflow-hidden border-gray-200 dark:border-gray-600"
      styles={{ body: { padding: '4px' } }}
      style={{
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        transition: 'all 0.3s ease',
        cursor: onItemClick ? 'pointer' : 'default'
      }}
      onClick={handleCardClick}
      cover={
        <div 
          className="relative overflow-hidden"
          style={{ 
            aspectRatio: '1 / 1',
            background: 'linear-gradient(135deg, #f5f5f5 0%, #737373 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {!imageError ? (
            <img
              src={imageVersion !== '389' ? 
                getItemImageFallback(item.id, imageVersion) : 
                (item.icon || getItemImage(item.id))
              }
              alt={item.name}
              style={{ 
                width: '60%', 
                height: '60%', 
                objectFit: 'contain',
                imageRendering: 'pixelated'
              }}
              onError={handleImageError}
              loading="lazy" // 이미지 lazy loading
            />
          ) : (
            <div className="text-gray-400 dark:text-gray-500 text-center">
              <div className="text-5xl mb-2">📦</div>
              <div className="text-xs dark:text-gray-400">이미지 없음</div>
            </div>
          )}
          
          {/* 즐겨찾기 버튼 */}
          <div className="absolute top-1 left-1">
            <FavoriteButton
              item={{
                id: item.id,
                type: 'item',
                name: item.name,
                icon: item.icon || getItemImage(item.id),
                meta: {
                  category: item.category,
                  subcategory: item.subcategory,
                  description: item.description,
                  cash: item.cash,
                  price: item.price,
                }
              }}
              size="small"
              type="text"
            />
          </div>
          
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
            <div 
              className="font-medium text-sm truncate" 
              style={{ 
                color: currentTheme === 'dark' ? '#ffffff' : '#111827' 
              }}
              title={item.name}
            >
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
              <div className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                {item.price.toLocaleString()} 메소
              </div>
            ) : (
              <div className="text-xs text-gray-400 dark:text-gray-500">
                ID: {item.id}
              </div>
            )}
          </div>
        }
      />
    </Card>
  );
});

// displayName 설정 (디버깅용)
ItemCard.displayName = 'ItemCard';

export { ItemCard };