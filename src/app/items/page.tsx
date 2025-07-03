'use client';

import { useState, useCallback, useEffect } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, App, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { ItemList } from '@/components/items/item-list';
import { ItemDetailModal } from '@/components/items/item-detail-modal';
import { MapleItem } from '@/types/maplestory';
import { loadItems, clearCache } from '@/lib/cdn-data-loader';
import debounce from 'lodash.debounce';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// 카테고리 옵션
const ITEM_CATEGORIES = {
  overallCategories: [
    { value: 'Equip', label: '장비' },
    { value: 'Use', label: '소비' },
    { value: 'Setup', label: '설치' },
    { value: 'Etc', label: '기타' },
    { value: 'Cash', label: '캐시' },
  ],
  equipCategories: [
    { value: '전체', label: '전체' },
    { value: 'Accessory', label: '장신구' },
    { value: 'Armor', label: '방어구' },
    { value: 'One-Handed Weapon', label: '한손 무기' },
    { value: 'Two-Handed Weapon', label: '두손 무기' },
    { value: 'Secondary Weapon', label: '보조 무기' },
    { value: 'Character', label: '성형/헤어/피부' },
    { value: 'Mount', label: '라이딩' },
    { value: 'Other', label: '그 외' },
  ],
  armorSubCategories: [
    { value: '전체', label: '전체' },
    { value: 'Hat', label: '모자' },
    { value: 'Overall', label: '한벌옷' },
    { value: 'Top', label: '상의' },
    { value: 'Bottom', label: '하의' },
    { value: 'Shoes', label: '신발' },
    { value: 'Glove', label: '장갑' },
    { value: 'Cape', label: '망토' },
    { value: 'Shield', label: '방패' },
  ],
  accessorySubCategories: [
    { value: '전체', label: '전체' },
    { value: 'Face Accessory', label: '얼굴장식' },
    { value: 'Eye Decoration', label: '눈장식' },
    { value: 'Earrings', label: '귀걸이' },
    { value: 'Ring', label: '반지' },
    { value: 'Pendant', label: '펜던트' },
    { value: 'Belt', label: '벨트' },
    { value: 'Medal', label: '메달' },
    { value: 'Shoulder Accessory', label: '어깨장식' },
    { value: 'Badge', label: '뱃지' },
    { value: 'Emblem', label: '엠블렘' },
    { value: 'Pocket Item', label: '포켓 아이템' },
  ],
  useSubCategories: [
    { value: '전체', label: '전체' },
    { value: 'Consumable', label: '소비' },
    { value: 'Character Modification', label: '성형/변경' },
    { value: 'Armor Scroll', label: '방어구 주문서' },
    { value: 'Weapon Scroll', label: '무기 주문서' },
    { value: 'Special Scroll', label: '특수 주문서' },
    { value: 'Recipe', label: '제작서' },
    { value: 'Projectile', label: '투사체' },
    { value: 'Monster/Familiar', label: '몬스터/펫' },
    { value: 'Tablet', label: '태블릿' },
    { value: 'Other', label: '기타' },
  ],
  setupSubCategories: [
    { value: '전체', label: '전체' },
    { value: 'Chair', label: '의자' },
    { value: 'Decoration', label: '장식' },
    { value: 'Container', label: '컨테이너' },
    { value: 'Core', label: '코어' },
    { value: 'Event Item', label: '이벤트' },
    { value: 'Extractor', label: '추출기' },
    { value: 'Mission', label: '미션' },
    { value: 'Title', label: '타이틀' },
    { value: 'Other', label: '기타' },
  ],
  etcSubCategories: [
    { value: '전체', label: '전체' },
    { value: 'Quest Item', label: '퀘스트' },
    { value: 'Monster Drop', label: '몬스터 드롭' },
    { value: 'Crafting Item', label: '제작 재료' },
    { value: 'Mineral Ore', label: '광물' },
    { value: 'Mineral Processed', label: '가공 광물' },
    { value: 'Rare Ore', label: '희귀 광물' },
    { value: 'Rare Processed  Ore', label: '희귀 가공 광물' },
    { value: 'Herb', label: '약초' },
    { value: 'Herb Oil', label: '약초 오일' },
    { value: 'Coin', label: '코인' },
    { value: 'Book', label: '책' },
    { value: 'Container', label: '컨테이너' },
    { value: 'Event Item', label: '이벤트' },
    { value: 'Reward Item', label: '보상' },
    { value: 'Other', label: '기타' },
  ],
  cashSubCategories: [
    { value: '전체', label: '전체' },
    { value: 'Pet', label: '펫' },
    { value: 'Package', label: '패키지' },
    { value: 'Miracle Cube', label: '큐브' },
    { value: 'Special', label: '특수' },
    { value: 'Face Coupon', label: '얼굴 쿠폰' },
    { value: 'Hair Coupon', label: '헤어 쿠폰' },
    { value: 'Hair Color Coupon', label: '헤어 색상 쿠폰' },
    { value: 'Skin Coupon', label: '피부 쿠폰' },
    { value: 'EXP Coupon', label: 'EXP 쿠폰' },
    { value: 'Exchange Coupon', label: '교환 쿠폰' },
    { value: 'Teleport Rock', label: '텔레포트 록' },
    { value: 'Protection', label: '보호' },
    { value: 'Scroll', label: '주문서' },
    { value: 'Inventory Slot', label: '인벤토리' },
    { value: 'Other', label: '기타' },
  ],
};

export default function ItemsPage() {
  const { message } = App.useApp();
  const [allItems, setAllItems] = useState<any>({});
  const [items, setItems] = useState<MapleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MapleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('category');
  const [overallCategory, setOverallCategory] = useState<string>('Equip');
  const [category, setCategory] = useState<string>('전체');
  const [subCategory, setSubCategory] = useState<string>('전체');
  const [selectedItem, setSelectedItem] = useState<MapleItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pageSize = 24;

  // 임시: CDN 아이템 데이터 제거로 인한 비활성화
  useEffect(() => {
    setDataLoading(false);
    setAllItems({});
    setItems([]);
    setFilteredItems([]);
    message.info('아이템 데이터는 API 전용으로 변경되었습니다. 개별 아이템 검색은 다른 페이지에서 이용해주세요.');
  }, [message]);

  // 카테고리별 필터링
  useEffect(() => {
    if (dataLoading || Object.keys(allItems).length === 0) return;

    setLoading(true);
    try {
      console.log(`🔍 ${overallCategory} 카테고리 필터링 중...`);
      
      // 전체 데이터에서 해당 카테고리만 필터링
      const filteredData = Object.values(allItems).filter((item: any) => {
        const typeInfo = item.originalData?.typeInfo || item.typeInfo;
        return typeInfo?.overallCategory === overallCategory;
      });

      console.log(`📊 ${overallCategory}: ${filteredData.length}개 아이템 발견`);

      // 테스트: 이터널 원더러 아이템들 찾기
      const eternalItems = filteredData.filter((item: any) => 
        item.name?.includes('이터널 원더러')
      );
      if (eternalItems.length > 0) {
        console.log('🗡️ 발견된 이터널 원더러 아이템들:', eternalItems.map((item: any) => ({
          id: item.id,
          name: item.name,
          hasRequirements: item.requirements?.level > 0,
          hasAttack: item.combat?.attack > 0,
          requirements: item.requirements,
          combat: item.combat
        })));
      }

      // 특별히 1232053 확인
      const item1232053 = filteredData.find((item: any) => item.id === 1232053);
      if (item1232053) {
        console.log('🔍 1232053 상세 데이터:', {
          id: (item1232053 as any).id,
          name: (item1232053 as any).name,
          requirements: (item1232053 as any).requirements,
          combat: (item1232053 as any).combat,
          stats: (item1232053 as any).stats
        });
      }

      // MapleItem 형식으로 변환
      const convertedItems = filteredData.map((item: any) => {
        const typeInfo = item.originalData?.typeInfo || item.typeInfo;
        
        // 아이템 스탯 유무 확인
        const hasStats = item.requirements && (
          item.requirements.level > 0 ||
          item.requirements.str > 0 ||
          item.requirements.dex > 0 ||
          item.requirements.int > 0 ||
          item.requirements.luk > 0
        );
        
        const hasCombat = item.combat && (
          item.combat.attack > 0 ||
          item.combat.magicAttack > 0 ||
          item.combat.defense > 0 ||
          item.combat.accuracy > 0
        );
        
        const mappedItem = {
          id: item.id,
          name: item.name,
          category: typeInfo?.category || item.category || '',
          subcategory: typeInfo?.subCategory || item.subCategory || '',
          description: item.description || '',
          icon: `https://maplestory.io/api/KMS/389/item/${item.id}/icon`,
          cash: item.isCash || item.originalData?.isCash || false,
          price: item.sellPrice || 0,
          level: item.level || 0,
          rarity: item.rarity || 'common',
          // 상세 장비 정보 추가
          requirements: item.requirements,
          combat: item.combat,
          stats: item.stats,
          enhancement: item.enhancement,
          setInfo: item.setInfo,
          special: item.special,
          weapon: item.weapon,
          armor: item.armor,
          accessory: item.accessory,
          // 스탯 유무 정보 추가 (정렬에 사용)
          _hasValidStats: hasStats || hasCombat,
        };
        
        // 카테고리 디버깅
        if (['Setup', 'Etc', 'Cash'].includes(overallCategory) && Math.random() < 0.1) {
          console.log(`${overallCategory} 아이템 매핑:`, {
            name: item.name,
            category: mappedItem.category,
            subcategory: mappedItem.subcategory,
            originalData: typeInfo
          });
        }
        
        return mappedItem;
      }) as MapleItem[];

      // 카테고리 값들 확인용 로깅
      if (['Setup', 'Etc', 'Cash'].includes(overallCategory)) {
        const uniqueSubcategories = [...new Set(convertedItems.map(item => item.subcategory))].filter(Boolean);
        console.log(`📋 ${overallCategory} 고유 서브카테고리:`, uniqueSubcategories);
      }

      setItems(convertedItems);
      setFilteredItems(convertedItems);
    } catch (error) {
      console.error('❌ 필터링 실패:', error);
      message.error('데이터 필터링에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [allItems, overallCategory, dataLoading, message]);

  // 검색 및 세부 필터링
  useEffect(() => {
    let filtered = [...items];

    // 검색 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 장비 카테고리 필터
    if (overallCategory === 'Equip') {
      // 2차 카테고리 필터 ('전체'가 아닐 때만 필터링)
      if (category && category !== '전체') {
        filtered = filtered.filter(item => item.category === category);
      }
      
      // 3차 카테고리 필터 ('전체'가 아닐 때만 필터링)
      if (subCategory && subCategory !== '전체') {
        filtered = filtered.filter(item => item.subcategory === subCategory);
      }
    }
    
    // 소비아이템 카테고리 필터 (2차와 3차가 동일하므로 한 번만 적용)
    if (overallCategory === 'Use') {
      if (category && category !== '전체') {
        filtered = filtered.filter(item => item.category === category);
      }
    }
    
    // 설치아이템 카테고리 필터 (subCategory 기반)
    if (overallCategory === 'Setup') {
      if (category && category !== '전체') {
        console.log(`🔍 설치 아이템 필터: ${category}, 전체 아이템: ${filtered.length}`);
        filtered = filtered.filter(item => item.subcategory === category);
        console.log(`✅ 설치 아이템 필터 후: ${filtered.length}`);
      }
    }
    
    // 기타아이템 카테고리 필터 (subCategory 기반)
    if (overallCategory === 'Etc') {
      if (category && category !== '전체') {
        console.log(`🔍 기타 아이템 필터: ${category}, 전체 아이템: ${filtered.length}`);
        filtered = filtered.filter(item => item.subcategory === category);
        console.log(`✅ 기타 아이템 필터 후: ${filtered.length}`);
      }
    }
    
    // 캐시아이템 카테고리 필터 (subCategory 기반)
    if (overallCategory === 'Cash') {
      if (category && category !== '전체') {
        console.log(`🔍 캐시 아이템 필터: ${category}, 전체 아이템: ${filtered.length}`);
        filtered = filtered.filter(item => item.subcategory === category);
        console.log(`✅ 캐시 아이템 필터 후: ${filtered.length}`);
      }
    }

    // 정렬 (스탯이 있는 아이템 우선)
    filtered.sort((a, b) => {
      // 먼저 스탯 유무로 정렬 (스탯 있는 것이 우선)
      const aHasStats = (a as any)._hasValidStats || false;
      const bHasStats = (b as any)._hasValidStats || false;
      
      if (aHasStats !== bHasStats) {
        return bHasStats ? 1 : -1;
      }
      
      // 그 다음 선택된 정렬 기준 적용
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ko');
        case 'category':
          return (a.category || '').localeCompare(b.category || '', 'ko');
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [items, searchQuery, sortBy, category, subCategory, overallCategory]);

  // 대분류 변경시 하위 카테고리 초기화
  useEffect(() => {
    setCategory('');
    setSubCategory('');
  }, [overallCategory]);

  // 검색 핸들러
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  const handleSearch = (value: string) => {
    debouncedSearch(value);
  };

  const handleItemClick = (item: MapleItem) => {
    console.log('🎯 handleItemClick 호출됨! 아이템:', item.name, item.id);
    console.log('📋 아이템 requirements:', item.requirements);
    console.log('⚔️ 아이템 combat:', item.combat);
    console.log('📊 아이템 stats:', item.stats);
    
    console.log('📂 모달 상태 변경 시작...');
    
    // 즉시 모달 열기 (로딩 상태로)
    setSelectedItem(item);
    setModalOpen(true);
    
    console.log('✅ 모달 상태 변경 완료! modalOpen=true, selectedItem=', item.name);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  // 로딩 화면
  if (dataLoading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" spinning={true} tip="전체 아이템 데이터를 로딩하는 중...">
            <div style={{ minHeight: '200px' }} />
          </Spin>
          <div style={{ marginTop: '20px', color: '#666' }}>
            57,490개의 완전한 아이템 데이터를 청크별로 다운로드하고 있습니다...<br/>
            모든 방어구 아이템 (한벌옷, 하의, 신발, 장갑, 방패 등)이 포함됩니다.
          </div>
        </div>
      </MainLayout>
    );
  }

  // 페이지네이션
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <Title level={2}>아이템 정보</Title>
          <Paragraph>
            메이플스토리의 다양한 아이템을 검색하고 확인할 수 있습니다.
            <br />
            📊 총 {Object.keys(allItems).length?.toLocaleString()}개 아이템 로드됨
          </Paragraph>
        </div>

        {/* 필터 섹션 */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '24px',
          marginTop: '32px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <Row gutter={[16, 24]}>
            {/* 대분류 */}
            <Col span={24}>
              <Row gutter={[12, 16]} align="middle">
                <Col xs={24} sm={8} md={6} lg={4}>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={overallCategory}
                    onChange={(value) => {
                      setOverallCategory(value);
                      // 대분류 변경 시 하위 카테고리를 전체로 설정
                      if (value === 'Equip') {
                        setCategory('전체');
                        setSubCategory('전체');
                      } else if (value === 'Use') {
                        setCategory('전체');
                        setSubCategory('전체');
                      } else if (value === 'Setup') {
                        setCategory('전체');
                        setSubCategory('전체');
                      } else if (value === 'Etc') {
                        setCategory('전체');
                        setSubCategory('전체');
                      } else if (value === 'Cash') {
                        setCategory('전체');
                        setSubCategory('전체');
                      } else {
                        setCategory('');
                        setSubCategory('');
                      }
                    }}
                    placeholder="대분류"
                  >
                    {ITEM_CATEGORIES.overallCategories.map(cat => (
                      <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                    ))}
                  </Select>
                </Col>
                
                {/* 2차 분류 */}
                {overallCategory === 'Equip' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category || '전체'}
                      onChange={(value) => {
                        setCategory(value);
                        // 2차 분류 변경 시 하위 카테고리를 첫 번째 옵션으로 설정
                        if (value === '전체') {
                          setSubCategory('전체');
                        } else if (value === 'Accessory') {
                          setSubCategory('전체');
                        } else if (value === 'Armor') {
                          setSubCategory('전체');
                        } else if (value === 'Character') {
                          setSubCategory('Face');
                        } else {
                          setSubCategory('');
                        }
                      }}
                    >
                      {ITEM_CATEGORIES.equipCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
                
                {/* 소비아이템 2차 분류 */}
                {overallCategory === 'Use' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category || '전체'}
                      onChange={(value) => {
                        setCategory(value);
                        // 소비 아이템의 하위 카테고리 설정
                        if (value === '전체') {
                          setSubCategory('전체');
                        } else {
                          setSubCategory(value); // 소비 아이템은 2차와 3차가 같음
                        }
                      }}
                      allowClear
                    >
                      {ITEM_CATEGORIES.useSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 설치아이템 2차 분류 */}
                {overallCategory === 'Setup' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category || '전체'}
                      onChange={(value) => {
                        setCategory(value);
                        setSubCategory(value); // 설치 아이템도 2차와 3차가 같음
                      }}
                      placeholder="설치 종류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.setupSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 기타아이템 2차 분류 */}
                {overallCategory === 'Etc' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category || '전체'}
                      onChange={(value) => {
                        setCategory(value);
                        setSubCategory(value); // 기타 아이템도 2차와 3차가 같음
                      }}
                      placeholder="기타 종류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.etcSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 캐시아이템 2차 분류 */}
                {overallCategory === 'Cash' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category || '전체'}
                      onChange={(value) => {
                        setCategory(value);
                        setSubCategory(value); // 캐시 아이템도 2차와 3차가 같음
                      }}
                      placeholder="캐시 종류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.cashSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 방어구 */}
                {overallCategory === 'Equip' && category === 'Armor' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory || '전체'}
                      onChange={setSubCategory}
                      placeholder="방어구 종류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.armorSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 장신구 */}
                {overallCategory === 'Equip' && category === 'Accessory' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory || '전체'}
                      onChange={setSubCategory}
                      placeholder="장신구 종류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.accessorySubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
              </Row>
            </Col>
            
            {/* 검색 및 정렬 */}
            <Col span={24}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={16} md={12}>
                  <Search
                    placeholder="아이템 이름을 검색하세요"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onChange={(e) => handleSearch(e.target.value)}
                    onSearch={handleSearch}
                  />
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={sortBy}
                    onChange={setSortBy}
                    placeholder="정렬 기준"
                  >
                    <Option value="category">카테고리순 (스탯 우선)</Option>
                    <Option value="name">이름순 (스탯 우선)</Option>
                  </Select>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        {/* 결과 정보 */}
        <div style={{ 
          padding: '12px 16px', 
          background: '#f5f5f5', 
          borderRadius: '6px',
          marginBottom: '16px' 
        }}>
          <span>
            {overallCategory && (
              <>
                {ITEM_CATEGORIES.overallCategories.find(cat => cat.value === overallCategory)?.label}
                {category && (
                  <>
                    {' > '}
                    {overallCategory === 'Equip' && ITEM_CATEGORIES.equipCategories.find(cat => cat.value === category)?.label}
                    {overallCategory === 'Use' && ITEM_CATEGORIES.useSubCategories.find(cat => cat.value === category)?.label}
                    {overallCategory === 'Setup' && ITEM_CATEGORIES.setupSubCategories.find(cat => cat.value === category)?.label}
                    {overallCategory === 'Etc' && ITEM_CATEGORIES.etcSubCategories.find(cat => cat.value === category)?.label}
                    {overallCategory === 'Cash' && ITEM_CATEGORIES.cashSubCategories.find(cat => cat.value === category)?.label}
                  </>
                )}
                {subCategory && (
                  <>
                    {' > '}
                    {category === 'Armor' && ITEM_CATEGORIES.armorSubCategories.find(cat => cat.value === subCategory)?.label}
                    {category === 'Accessory' && ITEM_CATEGORIES.accessorySubCategories.find(cat => cat.value === subCategory)?.label}
                  </>
                )}
              </>
            )}
            : {filteredItems.length.toLocaleString()}개
            {searchQuery && ` (검색어: "${searchQuery}")`}
          </span>
        </div>

        {/* 아이템 리스트 */}
        <div style={{ marginBottom: '4px' }}>
          <ItemList items={paginatedItems} loading={loading} onItemClick={handleItemClick} />
        </div>

        {/* 페이지네이션 */}
        {!loading && filteredItems.length > 0 && (
          <div style={{ marginTop: '4px' }}>
            <Pagination
              current={currentPage}
              total={filteredItems.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total, range) => `${range[0]}-${range[1]} / 총 ${total}개`}
            />
          </div>
        )}

        {/* 아이템 상세 모달 */}
        <ItemDetailModal
          item={selectedItem}
          open={modalOpen}
          onClose={handleModalClose}
        />
      </div>
    </MainLayout>
  );
}