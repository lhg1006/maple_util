'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Typography, Descriptions, Tag, Spin, Alert } from 'antd';
import { MapleItem } from '@/types/maplestory';
import { mergeItemWithStats } from '@/lib/item-stats-fetcher';
import { useItemStats } from '@/hooks/use-item-stats';

const { Title, Text } = Typography;

interface ItemDetailModalProps {
  item: MapleItem | null;
  open: boolean;
  onClose: () => void;
  loading?: boolean;
}

export function ItemDetailModal({ item, open, onClose, loading = false }: ItemDetailModalProps) {
  // 장비 아이템인지 확인하고 실시간 스탯 조회 필요 여부 결정
  const isEquipment = item?.category && ['Accessory', 'Armor', 'One-Handed Weapon', 'Two-Handed Weapon', 'Secondary Weapon'].includes(item.category);
  const hasNoStats = !item?.requirements?.level && !item?.combat?.attack && !item?.stats?.str;
  const isCashItem = item?.cash || false;
  const shouldFetchStats = isEquipment && hasNoStats && !isCashItem; // 장비이면서 CDN에 스탯이 없고 캐시아이템이 아닐 때만 API 호출
  
  // 디버깅용
  useEffect(() => {
    if (item && open) {
      console.log(`🔍 아이템 ${item.id} 분석:`, {
        name: item.name,
        category: item.category,
        isEquipment,
        hasNoStats,
        isCashItem,
        shouldFetchStats,
        requirements: item.requirements,
        combat: item.combat,
        stats: item.stats
      });
      
      if (shouldFetchStats) {
        console.log(`✅ API 호출 조건 충족! 아이템 ${item.id} (${item.name})에 대해 React Query 시작`);
      } else {
        if (isCashItem) {
          console.log(`💰 캐시 아이템이므로 API 호출 건너뜀: ${item.name}`);
        } else {
          console.log(`❌ API 호출 조건 불충족. shouldFetchStats: ${shouldFetchStats}`);
        }
      }
    }
  }, [item?.id, item?.name, open]);

  // React Query로 스탯 데이터 가져오기
  const { 
    data: statsData, 
    isLoading: isLoadingStats, 
    error: statsError,
    isFetching
  } = useItemStats(item?.id || 0, shouldFetchStats);

  // React Query 상태 디버깅
  useEffect(() => {
    if (shouldFetchStats && item) {
      console.log(`🔄 React Query 상태 for item ${item.id}:`, {
        isLoadingStats,
        isFetching,
        hasData: !!statsData,
        hasError: !!statsError,
        enabled: shouldFetchStats
      });
    }
  }, [shouldFetchStats, item?.id, isLoadingStats, isFetching, !!statsData, !!statsError]);

  // 모달 open 상태 변경 로깅
  useEffect(() => {
    console.log('🔄 모달 open 상태 변경:', open, '아이템:', item?.name);
    if (shouldFetchStats) {
      console.log(`🔄 React Query로 아이템 ${item?.id} 스탯 조회 시작...`);
    }
  }, [open, item?.id, item?.name, shouldFetchStats]);

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
    
    // 무기 정보가 없는 무기 아이템인 경우 기본 정보 생성
    if (isEquipment && !result.weapon && item.category?.includes('Weapon')) {
      const weaponType = item.category === 'One-Handed Weapon' ? '한손 무기' :
                        item.category === 'Two-Handed Weapon' ? '두손 무기' :
                        item.category === 'Secondary Weapon' ? '보조 무기' : '무기';
      
      result.weapon = {
        weaponType: weaponType,
        attackSpeed: statsData?.enhancement?.attackSpeed || 0,
        isTwoHanded: item.category === 'Two-Handed Weapon'
      };
    }
    
    return result;
  }, [item, isEquipment, statsData]);

  if (!enhancedItem) return null;

  // 디버깅용 로그
  console.log('모달에서 받은 아이템 데이터:', enhancedItem);

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
      // 세부 카테고리
      'Hat': '모자',
      'Overall': '한벌옷',
      'Top': '상의',
      'Bottom': '하의',
      'Shoes': '신발',
      'Glove': '장갑',
      'Cape': '망토',
      'Shield': '방패',
      'Face Accessory': '얼굴장식',
      'Eye Decoration': '눈장식',
      'Earrings': '귀걸이',
      'Ring': '반지',
      'Pendant': '펜던트',
      'Belt': '벨트',
      'Medal': '메달',
      'Shoulder Accessory': '어깨장식',
      'Badge': '뱃지',
      'Emblem': '엠블렘',
      'Pocket Item': '포켓 아이템',
      'Other': '기타',
      // 무기 타입들
      'Sword': '검',
      'Axe': '도끼',
      'Bow': '활',
      'Staff': '스태프',
      'Wand': '완드',
      'Dagger': '단검',
      'Claw': '아대',
      'Gun': '총',
      'Knuckle': '너클',
      'Mace': '둔기',
      'Spear': '창',
      'Polearm': '폴암',
      'Unknown': '알 수 없음'
    };
    return translations[category] || category;
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'accessory': return 'purple';
      case 'armor': return 'blue';
      case 'weapon': return 'red';
      case 'one-handed weapon': return 'red';
      case 'two-handed weapon': return 'red';
      case 'secondary weapon': return 'orange';
      case 'consumable': return 'green';
      case 'chair': return 'cyan';
      case 'decoration': return 'magenta';
      case 'pet': return 'pink';
      default: return 'default';
    }
  };

  const isEquipmentCategory = (category?: string) => {
    if (!category) return false;
    const equipCategories = ['Accessory', 'Armor', 'One-Handed Weapon', 'Two-Handed Weapon', 'Secondary Weapon'];
    return equipCategories.includes(category);
  };

  const isWeapon = (category?: string) => {
    if (!category) return false;
    return category.includes('Weapon') || category === 'Weapon';
  };

  const isArmor = (category?: string) => {
    return category === 'Armor';
  };

  const isAccessory = (category?: string) => {
    return category === 'Accessory';
  };

  const getEquipmentTypeLabel = (category?: string) => {
    if (isWeapon(category)) {
      return '무기';
    } else if (isArmor(category)) {
      return '방어구';
    } else if (isAccessory(category)) {
      return '장신구';
    }
    return '장비';
  };

  const hasRequirements = (requirements: any) => {
    console.log('🔍 requirements 체크:', requirements);
    const hasReq = requirements && (
      requirements.level > 0 ||
      requirements.str > 0 ||
      requirements.dex > 0 ||
      requirements.int > 0 ||
      requirements.luk > 0
    );
    console.log('📊 hasRequirements 결과:', hasReq);
    return hasReq;
  };

  const hasCombatStats = (combat: any) => {
    console.log('⚔️ combat 체크:', combat);
    const hasCombat = combat && (
      combat.attack > 0 ||
      combat.magicAttack > 0 ||
      combat.defense > 0 ||
      combat.magicDefense > 0 ||
      combat.accuracy > 0 ||
      combat.avoidability > 0 ||
      combat.speed > 0 ||
      combat.jump > 0 ||
      (combat.bossDamage && combat.bossDamage > 0) ||
      (combat.ignoreDefense && combat.ignoreDefense > 0)
    );
    console.log('⚔️ hasCombatStats 결과:', hasCombat);
    return hasCombat;
  };

  const hasStatBonus = (stats: any) => {
    return stats && (
      stats.str > 0 ||
      stats.dex > 0 ||
      stats.int > 0 ||
      stats.luk > 0 ||
      stats.hp > 0 ||
      stats.mp > 0
    );
  };

  // 메이플 특수 태그 파싱 함수
  const parseMapleDescription = (description: string) => {
    if (!description) return description;

    let parsed = description;

    // #c...# 강조 텍스트 처리
    parsed = parsed.replace(/#c([^#]*)#/g, '<strong style="color: #ff6b35;">$1</strong>');

    // #B...# 더 큰 강조 처리
    parsed = parsed.replace(/#B([^#]*)#/g, '<strong style="color: #ff4757; font-size: 1.1em;">$1</strong>');

    // #z아이템ID# 아이템 이름 치환 (임시로 링크 스타일 적용)
    parsed = parsed.replace(/#z(\d+)#/g, '<span style="color: #3742fa; text-decoration: underline; cursor: pointer;" title="아이템 ID: $1">[아이템 $1]</span>');

    // #i아이템ID# 아이템 아이콘 (임시로 아이콘 표시)
    parsed = parsed.replace(/#i(\d+)#/g, '<span style="color: #2ed573; font-weight: bold;" title="아이템 아이콘 ID: $1">🎯</span>');

    // #t아이템ID# 아이템 툴팁 (임시로 링크 스타일 적용)
    parsed = parsed.replace(/#t(\d+)#/g, '<span style="color: #5352ed; text-decoration: underline; cursor: pointer;" title="아이템 툴팁 ID: $1">[툴팁 $1]</span>');

    return parsed;
  };


  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={enhancedItem.icon} 
            alt={enhancedItem.name}
            style={{ width: '32px', height: '32px' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Title level={4} style={{ margin: 0 }}>
              {enhancedItem.name}
            </Title>
            {getItemVersion(enhancedItem) && (
              <Tag color="blue" size="small">
                {getItemVersion(enhancedItem)}
              </Tag>
            )}
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      styles={{
        body: { padding: '24px' }
      }}
    >
      <Spin spinning={loading || isLoadingStats}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {/* 아이템 이미지 */}
          <div style={{ flex: '0 0 auto', textAlign: 'center', position: 'relative' }}>
            <div style={{ 
              width: '200px', 
              height: '200px', 
              border: '2px solid #d1d5db',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f9fafb',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              position: 'relative'
            }}>
              <img 
                src={enhancedItem.icon} 
                alt={enhancedItem.name}
                style={{ 
                  width: '90%', 
                  height: '90%', 
                  objectFit: 'contain',
                  imageRendering: 'pixelated'
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/no-image.png';
                }}
              />
              
              {/* 배지들 */}
              <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* Cash 배지 */}
                {enhancedItem.cash && (
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#FFD700',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: '#000',
                      border: '2px solid #FFA500',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      zIndex: 1
                    }}
                    title="캐시 아이템"
                  >
                    ₩
                  </div>
                )}
                
                {/* PC방 배지 */}
                {isPCBang(enhancedItem) && (
                  <div 
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: '#00D2FF',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: '#FFF',
                      border: '2px solid #0099CC',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                      zIndex: 1
                    }}
                    title="PC방 전용 아이템"
                  >
                    PC
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 아이템 정보 */}
          <div style={{ flex: 1 }}>
            <Descriptions 
              column={1} 
              size="small"
              styles={{ 
                label: { width: '100px', fontWeight: 'bold' } 
              }}
            >
              <Descriptions.Item label="아이템 ID">
                <Text code>{enhancedItem.id}</Text>
                {(isLoadingStats || isFetching) && (
                  <Tag color="processing" style={{ marginLeft: '8px' }}>
                    <Spin size="small" style={{ marginRight: '4px' }} />
                    {isFetching && statsData ? '스탯 업데이트중...' : '실시간 스탯 조회중...'}
                  </Tag>
                )}
                {statsError && (
                  <Tag color="error" style={{ marginLeft: '8px' }}>
                    스탯 조회 실패
                  </Tag>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="분류">
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Tag color={getCategoryColor(enhancedItem.category || '')}>
                    {translateCategory(enhancedItem.category || '') || '미분류'}
                  </Tag>
                  {enhancedItem.subcategory && enhancedItem.subcategory !== enhancedItem.category && (
                    <Tag color="default">
                      {translateCategory(enhancedItem.subcategory)}
                    </Tag>
                  )}
                </div>
              </Descriptions.Item>

              {/* 장비 타입별 추가 정보 */}
              {isEquipmentCategory(enhancedItem.category) && (
                <>
                  <Descriptions.Item label="장비 종류">
                    <Tag color="blue">{getEquipmentTypeLabel(enhancedItem.category)}</Tag>
                  </Descriptions.Item>
                  
                  {/* 무기 정보 */}
                  {isWeapon(enhancedItem.category) && (
                    <Descriptions.Item label="무기 종류">
                      <Tag color="red">{translateCategory(enhancedItem.category)}</Tag>
                    </Descriptions.Item>
                  )}
                  
                  {/* 방어구 정보 */}
                  {isArmor(enhancedItem.category) && (
                    <Descriptions.Item label="방어구 부위">
                      <Tag color="blue">{translateCategory(enhancedItem.subcategory)}</Tag>
                    </Descriptions.Item>
                  )}
                  
                  {/* 장신구 정보 */}
                  {isAccessory(enhancedItem.category) && (
                    <Descriptions.Item label="장신구 종류">
                      <Tag color="purple">{translateCategory(enhancedItem.subcategory)}</Tag>
                    </Descriptions.Item>
                  )}
                </>
              )}

              {enhancedItem.description && (
                <Descriptions.Item label="설명">
                  <div 
                    style={{ whiteSpace: 'pre-wrap' }}
                    dangerouslySetInnerHTML={{
                      __html: parseMapleDescription(enhancedItem.description)
                    }}
                  />
                </Descriptions.Item>
              )}

              <Descriptions.Item label="판매 가격">
                <Text>
                  {(enhancedItem.price || 0) > 0 ? `${(enhancedItem.price || 0).toLocaleString()} 메소` : '판매 불가'}
                </Text>
              </Descriptions.Item>

              {/* 특수 아이템 타입 */}
              {(enhancedItem.cash || isPCBang(enhancedItem)) && (
                <Descriptions.Item label="아이템 타입">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {enhancedItem.cash && (
                      <Tag color="gold">캐시 아이템</Tag>
                    )}
                    {isPCBang(enhancedItem) && (
                      <Tag color="cyan">PC방 전용</Tag>
                    )}
                    {getItemVersion(enhancedItem) && (
                      <Tag color="blue">{getItemVersion(enhancedItem)} 버전</Tag>
                    )}
                  </div>
                </Descriptions.Item>
              )}

              {/* 장비 요구 조건 */}
              {(isLoadingStats || isFetching) && isEquipmentCategory(enhancedItem.category) && (
                <Descriptions.Item label="요구 조건">
                  <Tag color="default">
                    <Spin size="small" style={{ marginRight: '4px' }} />
                    스탯 로딩중...
                  </Tag>
                </Descriptions.Item>
              )}
              {!(isLoadingStats || isFetching) && enhancedItem.requirements && hasRequirements(enhancedItem.requirements) && (
                <Descriptions.Item label="요구 조건">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {enhancedItem.requirements.level > 0 && (
                      <Tag color="blue">레벨 {enhancedItem.requirements.level}</Tag>
                    )}
                    {enhancedItem.requirements.str > 0 && (
                      <Tag color="red">STR {enhancedItem.requirements.str}</Tag>
                    )}
                    {enhancedItem.requirements.dex > 0 && (
                      <Tag color="green">DEX {enhancedItem.requirements.dex}</Tag>
                    )}
                    {enhancedItem.requirements.int > 0 && (
                      <Tag color="blue">INT {enhancedItem.requirements.int}</Tag>
                    )}
                    {enhancedItem.requirements.luk > 0 && (
                      <Tag color="yellow">LUK {enhancedItem.requirements.luk}</Tag>
                    )}
                  </div>
                </Descriptions.Item>
              )}

              {/* 공격/방어 스탯 */}
              {(isLoadingStats || isFetching) && isEquipmentCategory(enhancedItem.category) && (
                <Descriptions.Item label="전투 능력">
                  <Tag color="default">
                    <Spin size="small" style={{ marginRight: '4px' }} />
                    스탯 로딩중...
                  </Tag>
                </Descriptions.Item>
              )}
              {!(isLoadingStats || isFetching) && enhancedItem.combat && hasCombatStats(enhancedItem.combat) && (
                <Descriptions.Item label="전투 능력">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {(enhancedItem.combat.attack || 0) > 0 && (
                      <Tag color="red">공격력 +{enhancedItem.combat.attack}</Tag>
                    )}
                    {(enhancedItem.combat.magicAttack || 0) > 0 && (
                      <Tag color="blue">마력 +{enhancedItem.combat.magicAttack}</Tag>
                    )}
                    {(enhancedItem.combat.defense || 0) > 0 && (
                      <Tag color="cyan">방어력 +{enhancedItem.combat.defense}</Tag>
                    )}
                    {(enhancedItem.combat.magicDefense || 0) > 0 && (
                      <Tag color="purple">마법방어 +{enhancedItem.combat.magicDefense}</Tag>
                    )}
                    {(enhancedItem.combat.accuracy || 0) > 0 && (
                      <Tag color="green">명중률 +{enhancedItem.combat.accuracy}</Tag>
                    )}
                    {(enhancedItem.combat.avoidability || 0) > 0 && (
                      <Tag color="orange">회피율 +{enhancedItem.combat.avoidability}</Tag>
                    )}
                    {(enhancedItem.combat.speed || 0) > 0 && (
                      <Tag color="lime">이동속도 +{enhancedItem.combat.speed}</Tag>
                    )}
                    {(enhancedItem.combat.jump || 0) > 0 && (
                      <Tag color="geekblue">점프력 +{enhancedItem.combat.jump}</Tag>
                    )}
                    {(enhancedItem.combat.bossDamage || 0) > 0 && (
                      <Tag color="volcano">보스 데미지 +{enhancedItem.combat.bossDamage}%</Tag>
                    )}
                    {(enhancedItem.combat.ignoreDefense || 0) > 0 && (
                      <Tag color="magenta">방어율 무시 +{enhancedItem.combat.ignoreDefense}%</Tag>
                    )}
                  </div>
                </Descriptions.Item>
              )}

              {/* 스탯 증가 */}
              {(isLoadingStats || isFetching) && isEquipmentCategory(enhancedItem.category) && (
                <Descriptions.Item label="능력치 증가">
                  <Tag color="default">
                    <Spin size="small" style={{ marginRight: '4px' }} />
                    스탯 로딩중...
                  </Tag>
                </Descriptions.Item>
              )}
              {!(isLoadingStats || isFetching) && enhancedItem.stats && hasStatBonus(enhancedItem.stats) && (
                <Descriptions.Item label="능력치 증가">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {enhancedItem.stats.str > 0 && (
                      <Tag color="red">STR +{enhancedItem.stats.str}</Tag>
                    )}
                    {enhancedItem.stats.dex > 0 && (
                      <Tag color="green">DEX +{enhancedItem.stats.dex}</Tag>
                    )}
                    {enhancedItem.stats.int > 0 && (
                      <Tag color="blue">INT +{enhancedItem.stats.int}</Tag>
                    )}
                    {enhancedItem.stats.luk > 0 && (
                      <Tag color="yellow">LUK +{enhancedItem.stats.luk}</Tag>
                    )}
                    {enhancedItem.stats.hp > 0 && (
                      <Tag color="volcano">HP +{enhancedItem.stats.hp}</Tag>
                    )}
                    {enhancedItem.stats.mp > 0 && (
                      <Tag color="cyan">MP +{enhancedItem.stats.mp}</Tag>
                    )}
                  </div>
                </Descriptions.Item>
              )}

              {/* 스탯 정보 없음 안내 */}
              {!(isLoadingStats || isFetching) && isEquipmentCategory(enhancedItem.category) && ((enhancedItem as any)._noStatsAvailable || (shouldFetchStats && !statsData && statsError)) && (
                <Descriptions.Item label="장비 정보">
                  <Alert
                    message="스탯 정보 없음"
                    description="이 아이템의 상세 스탯 정보를 maplestory.io API에서 찾을 수 없습니다."
                    type="info"
                    showIcon
                    style={{ fontSize: '12px' }}
                  />
                </Descriptions.Item>
              )}

              {/* 무기 정보 */}
              {enhancedItem.weapon && (
                <Descriptions.Item label="무기 정보">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Tag color="red">{translateCategory(enhancedItem.weapon.weaponType)}</Tag>
                    {enhancedItem.weapon.attackSpeed > 0 && (
                      <Tag color="blue">공격속도 {enhancedItem.weapon.attackSpeed}</Tag>
                    )}
                    {enhancedItem.weapon.isTwoHanded && (
                      <Tag color="orange">양손무기</Tag>
                    )}
                  </div>
                </Descriptions.Item>
              )}

              {/* 방어구 정보 */}
              {enhancedItem.armor && (
                <Descriptions.Item label="방어구 정보">
                  <Tag color="blue">{translateCategory(enhancedItem.armor.bodyPart)}</Tag>
                </Descriptions.Item>
              )}

              {/* 장신구 정보 */}
              {enhancedItem.accessory && (
                <Descriptions.Item label="장신구 정보">
                  <Tag color="purple">{enhancedItem.accessory.typeKorean || translateCategory(enhancedItem.accessory.type)}</Tag>
                </Descriptions.Item>
              )}

              {/* 강화 정보 */}
              {enhancedItem.enhancement && (
                <Descriptions.Item label="강화 정보">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {enhancedItem.enhancement.upgradeSlots > 0 && (
                      <Tag color="gold">업그레이드 슬롯 {enhancedItem.enhancement.upgradeSlots}개</Tag>
                    )}
                    {enhancedItem.enhancement.isUnique && (
                      <Tag color="magenta">고유 아이템</Tag>
                    )}
                    {enhancedItem.enhancement.isCash && (
                      <Tag color="red">캐시 아이템</Tag>
                    )}
                  </div>
                </Descriptions.Item>
              )}

              {/* 셋 아이템 정보 */}
              {enhancedItem.setInfo && (
                <Descriptions.Item label="셋 아이템">
                  <div>
                    <Tag color="purple">{enhancedItem.setInfo.setName}</Tag>
                    <Text type="secondary" style={{ marginLeft: '8px', fontSize: '12px' }}>
                      ({enhancedItem.setInfo.completeCount}개 세트)
                    </Text>
                  </div>
                </Descriptions.Item>
              )}

              {/* 특수 속성 */}
              {enhancedItem.special && (
                <Descriptions.Item label="특수 속성">
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {!enhancedItem.special.tradeable && (
                      <Tag color="red">교환 불가</Tag>
                    )}
                    {!enhancedItem.special.sellable && (
                      <Tag color="orange">판매 불가</Tag>
                    )}
                    {enhancedItem.special.expireOnLogout && (
                      <Tag color="gray">로그아웃시 삭제</Tag>
                    )}
                    {enhancedItem.special.accountSharable && (
                      <Tag color="blue">계정 공유</Tag>
                    )}
                  </div>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            아이템 이미지는 maplestory.io API에서 제공됩니다.
          </Text>
        </div>
      </Spin>
    </Modal>
  );
}