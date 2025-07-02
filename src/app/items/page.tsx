'use client';

import { useState, useCallback, useEffect } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, App } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { ItemList } from '@/components/items/item-list';
import { MapleItem } from '@/types/maplestory';
import { mapleAPI, ItemQueryParams } from '@/lib/api';
import { COMPLETE_ITEMS } from '@/data/complete-items';
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
    { value: 'Accessory', label: '장신구' }, // 첫 번째 위치 유지
    { value: 'Armor', label: '방어구' },
    { value: 'One-Handed Weapon', label: '한손 무기' },
    { value: 'Two-Handed Weapon', label: '두손 무기' },
    { value: 'Secondary Weapon', label: '보조 무기' },
    { value: 'Character', label: '성형/헤어/피부' },
    { value: 'Mount', label: '라이딩' },
    { value: 'Other', label: '그 외' },
  ],
  armorSubCategories: [
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
  oneHandedWeaponSubCategories: [
    { value: 'One-Handed Sword', label: '한손검' },
    { value: 'One-Handed Axe', label: '한손도끼' },
    { value: 'One-Handed Blunt Weapon', label: '한손둔기' },
    { value: 'Dagger', label: '단검' },
    { value: 'Cane', label: '케인' },
    { value: 'Wand', label: '완드' },
    { value: 'Staff', label: '스태프' },
    { value: 'Shining Rod', label: '샤이닝로드' },
    { value: 'Soul Shooter', label: '소울슈터' },
    { value: 'Desperado', label: '데스페라도' },
    { value: 'Whip Blade', label: '에너지소드' },
    { value: 'Katara', label: '블레이드' },
    { value: 'Ritual Fan', label: '부채' },
    { value: 'Psy-limiter', label: 'ESP리미터' },
    { value: 'Chain', label: '체인' },
    { value: 'Gauntlet', label: '건틀렛' },
  ],
  twoHandedWeaponSubCategories: [
    { value: 'Two-Handed Sword', label: '두손검' },
    { value: 'Two-Handed Axe', label: '두손도끼' },
    { value: 'Two-Handed Blunt', label: '두손둔기' },
    { value: 'Spear', label: '창' },
    { value: 'Pole Arm', label: '폴암' },
    { value: 'Bow', label: '활' },
    { value: 'Crossbow', label: '석궁' },
    { value: 'Claw', label: '아대' },
    { value: 'Knuckle', label: '너클' },
    { value: 'Gun', label: '건' },
    { value: 'Dual Bowgun', label: '듀얼보우건' },
    { value: 'Hand Cannon', label: '핸드캐논' },
    { value: 'Ancient Bow', label: '에인션트보우' },
    { value: 'Arm Cannon', label: '암캐논' },
  ],
  secondaryWeaponSubCategories: [
    { value: 'Spellbook', label: '주문서' },
    { value: 'Magic Arrow', label: '마법화살' },
    { value: 'Card', label: '카드' },
    { value: 'Orb', label: '오브' },
    { value: 'Rosary', label: '로사리오' },
    { value: 'Iron Chain', label: '철사슬' },
    { value: 'Magic Marble', label: '마법구슬' },
    { value: 'Arrowhead', label: '화살촉' },
    { value: 'Arrow Fletching', label: '시위' },
    { value: 'Bow Thimble', label: '골무' },
    { value: 'Dagger Scabbard', label: '단검 집' },
    { value: 'Wrist Band', label: '손목보호대' },
    { value: 'Magnum', label: '매그넘탄' },
    { value: 'Powder Keg', label: '화약통' },
    { value: 'Mass', label: '미사' },
    { value: 'Jewel', label: '보석' },
    { value: 'Relic', label: '유물' },
    { value: 'Transmitter', label: '트랜스미터' },
    { value: 'Medal', label: '메달' },
    { value: 'Fox Marble', label: '여우구슬' },
    { value: 'Chess Piece', label: '체스말' },
    { value: 'Soul Ring', label: '소울링' },
    { value: 'Charm', label: '부적' },
    { value: 'Core Controller', label: '코어컨트롤러' },
    { value: 'Document', label: '문서' },
    { value: 'Path', label: '패스' },
    { value: 'Wings', label: '날개' },
    { value: 'Charges', label: '차지' },
    { value: 'Ballast', label: '밸러스트' },
    { value: "Nova's Essence", label: '노바의 정수' },
  ],
  characterSubCategories: [
    { value: 'Hair', label: '헤어' },
    { value: 'Face', label: '성형' },
    { value: 'Head', label: '피부' },
  ],
};

export default function ItemsPage() {
  const { message } = App.useApp();
  const [items, setItems] = useState<MapleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MapleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('category');
  const [overallCategory, setOverallCategory] = useState<string>('Equip');
  const [category, setCategory] = useState<string>('Accessory'); // 기본값: 장신구
  const [subCategory, setSubCategory] = useState<string>('Face Accessory'); // 기본값: 얼굴장식
  const pageSize = 32;

  // 카테고리별 데이터 로드
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        // 대분류별 ID 범위에서 직접 가져오기 (API overallCategory 파라미터가 작동하지 않음)
        let startPosition = 0;
        let searchCount = 10000;
        
        switch (overallCategory) {
          case 'Equip':
            startPosition = 0;
            searchCount = 30000;
            break;
          case 'Use':
            startPosition = 30000; // Use 아이템은 API index 30000부터
            searchCount = 20000;
            break;
          case 'Setup':
            // Setup 아이템은 ID 3010000부터 시작하므로 직접 가져오기
            startPosition = 0;
            searchCount = 100000; // 전체에서 가져와서 필터링
            break;
          case 'Etc':
            // Etc 아이템은 ID 4000000부터 시작하므로 직접 가져오기
            startPosition = 0;
            searchCount = 100000; // 전체에서 가져와서 필터링
            break;
          case 'Cash':
            // Cash 아이템은 ID 5000000부터 시작하므로 직접 가져오기
            startPosition = 0;
            searchCount = 100000; // 전체에서 가져와서 필터링
            break;
        }

        // 완전한 데이터베이스 사용
        let filteredItems = Object.values(COMPLETE_ITEMS).map(item => ({
          id: item.id,
          name: item.name,
          category: item.category || '', // 중분류 (Armor, Accessory 등)
          subcategory: item.subCategory || '', // 소분류 (Hat, Top 등)
          description: item.description || '',
          // 이미지 URL 생성
          icon: `https://maplestory.io/api/KMS/389/item/${item.id}/icon`,
          // 추가 필드들
          cash: item.isCash || false,
          price: item.sellPrice || 0,
        })) as MapleItem[];
        
        // 대분류 필터링 (원본 API 데이터의 overallCategory 사용)
        console.log(`필터링 전 총 아이템 수: ${filteredItems.length}, 선택된 카테고리: ${overallCategory}`);
        
        // 카테고리별 아이템 수 확인
        const categoryCount = {};
        filteredItems.forEach(item => {
          const completeItem = COMPLETE_ITEMS[item.id];
          const cat = completeItem?.originalData?.typeInfo?.overallCategory || 'Unknown';
          categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        });
        console.log('전체 카테고리 분포:', categoryCount);
        
        filteredItems = filteredItems.filter(item => {
          // COMPLETE_ITEMS에서 원본 데이터 확인
          const completeItem = COMPLETE_ITEMS[item.id];
          if (completeItem && completeItem.originalData?.typeInfo?.overallCategory) {
            const originalOverallCategory = completeItem.originalData.typeInfo.overallCategory;
            const matches = originalOverallCategory === overallCategory;
            
            // Setup과 Etc 아이템 샘플 로그
            if (overallCategory === 'Setup' && item.id >= 3010000 && item.id < 3010010) {
              console.log(`Setup 샘플 - 아이템 ${item.id} (${item.name}): ${originalOverallCategory}`);
            }
            if (overallCategory === 'Etc' && item.id >= 4000000 && item.id < 4000010) {
              console.log(`Etc 샘플 - 아이템 ${item.id} (${item.name}): ${originalOverallCategory}`);
            }
            
            return matches;
          }
          
          // 폴백: 기존 방식 (원본 데이터가 없는 경우)
          const category = item.category?.toLowerCase() || '';
          switch (overallCategory) {
            case 'Equip':
              return category.includes('equip') || 
                     category.includes('accessory') || 
                     category.includes('armor') ||
                     category.includes('character');
            case 'Use':
              return category.includes('use') || 
                     category.includes('consumable');
            case 'Setup':
              return category.includes('setup') || 
                     category.includes('scroll');
            case 'Etc':
              return category.includes('etc') || 
                     category.includes('material') ||
                     category.includes('other') ||
                     category.includes('unknown');
            case 'Cash':
              return category.includes('cash') || item.cash === true;
            default:
              return true;
          }
        });
        
        console.log(`필터링 후 아이템 수: ${filteredItems.length}`);
        
        // API 데이터로 보완 비활성화 - 이미 완전한 로컬 데이터가 있음
        // 만약 API를 사용하려면 overallCategory를 올바르게 전달해야 함
        /*
        try {
          const params: ItemQueryParams = {
            overallCategory,
            startPosition,
            count: Math.min(searchCount, 1000),
          };
          
          const apiItems = await mapleAPI.getItemsByCategory(params);
          const existingIds = new Set(filteredItems.map(i => i.id));
          const newItems = apiItems.filter(item => 
            !existingIds.has(item.id) && 
            item.name && 
            item.name.trim() !== ''
          );
          
          if (newItems.length > 0) {
            filteredItems = [...filteredItems, ...newItems];
            console.log(`API에서 ${newItems.length}개 추가 아이템 발견`);
          }
        } catch (apiError) {
          console.warn('API 아이템 데이터 로딩 실패, 로컬 데이터만 사용:', apiError);
        }
        */
        
        // 카테고리 필터링 (실제 데이터의 카테고리 값 사용)
        if (category) {
          console.log(`중분류 필터링: ${category}`);
          filteredItems = filteredItems.filter(item => {
            const itemCategory = item.category;
            const matches = itemCategory === category;
            if (item.id % 10000 === 0) { // 샘플 로그
              console.log(`아이템 ${item.id} 카테고리: "${itemCategory}" vs 선택: "${category}" = ${matches}`);
            }
            return matches;
          });
          console.log(`중분류 필터링 후: ${filteredItems.length}개 아이템`);
        }
        
        // 서브카테고리 필터링  
        if (subCategory) {
          filteredItems = filteredItems.filter(item => item.subcategory === subCategory);
        }
        
        console.log(`총 ${filteredItems.length}개 아이템 로드 완료`);
        console.log(`필터링된 아이템 샘플:`, filteredItems.slice(0, 5).map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          overallCategory: COMPLETE_ITEMS[item.id]?.originalData?.typeInfo?.overallCategory
        })));
        setItems(filteredItems);
        setFilteredItems(filteredItems);
      } catch (error) {
        console.error('아이템 로딩 실패:', error);
        console.error('에러 상세:', error.message, error.stack);
        message.error(`아이템 데이터를 불러오는데 실패했습니다: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [overallCategory, category, subCategory, message]);

  // 검색 및 정렬 적용
  useEffect(() => {
    let filtered = [...items];

    // 검색 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ko', { numeric: true });
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'category':
          return (a.category || '').localeCompare(b.category || '', 'ko');
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
    setCurrentPage(1); // 검색/정렬 시 첫 페이지로 이동
  }, [items, searchQuery, sortBy]);

  // 검색 및 정렬 함수
  const filterAndSortItems = useCallback((query: string, sort: string) => {
    setSearchQuery(query);
    setSortBy(sort);
  }, []);

  // 디바운스된 검색 핸들러
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      filterAndSortItems(value, sortBy);
    }, 300),
    [filterAndSortItems, sortBy]
  );

  // 검색 입력 핸들러
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // 전체 검색 기능 (엔터키로 실행) - 로컬 데이터에서 검색
  const handleFullSearch = async (value: string) => {
    if (!value.trim()) return;
    
    setLoading(true);
    try {
      // 로컬 데이터에서 검색
      let searchResults = Object.values(COMPLETE_ITEMS).filter(item => {
        // 현재 선택된 카테고리 필터 적용
        const matchesCategory = item.originalData?.typeInfo?.overallCategory === overallCategory;
        if (!matchesCategory) return false;
        
        // 검색어 매칭
        return item.name.toLowerCase().includes(value.toLowerCase()) ||
               (item.description && item.description.toLowerCase().includes(value.toLowerCase()));
      }).map(item => ({
        id: item.id,
        name: item.name,
        category: item.category || '',
        subcategory: item.subCategory || '',
        description: item.description || '',
        icon: `https://maplestory.io/api/KMS/389/item/${item.id}/icon`,
        cash: item.isCash || false,
        price: item.sellPrice || 0,
      })) as MapleItem[];
      
      setItems(searchResults);
      setFilteredItems(searchResults);
      message.info(`검색 결과: ${searchResults.length}개 아이템`);
    } catch (error) {
      console.error('검색 실패:', error);
      message.error('검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    setSortBy(value);
    filterAndSortItems(searchQuery, value);
  };

  // 페이지네이션
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);
  
  // 디버깅: 실제 렌더링되는 아이템 확인
  if (paginatedItems.length > 0 && (overallCategory === 'Setup' || overallCategory === 'Etc')) {
    console.log(`렌더링되는 ${overallCategory} 아이템:`, paginatedItems.slice(0, 3).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      icon: item.icon
    })));
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <Title level={2}>아이템 정보</Title>
          <Paragraph>
            메이플스토리의 다양한 아이템 정보를 검색하고 확인할 수 있습니다.
          </Paragraph>
        </div>

        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '24px',
          marginTop: '32px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <Row gutter={[16, 24]}>
            <Col span={24}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6}>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={overallCategory}
                    onChange={(value) => {
                      setOverallCategory(value);
                      setCategory('');
                      setSubCategory('');
                    }}
                    placeholder="대분류"
                  >
                    {ITEM_CATEGORIES.overallCategories.map(cat => (
                      <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                    ))}
                  </Select>
                </Col>
                
                {overallCategory === 'Equip' && (
                  <Col xs={24} sm={12} md={6}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category}
                      onChange={(value) => {
                        setCategory(value);
                        // 카테고리별 기본 소분류 설정
                        if (value === 'Armor') {
                          setSubCategory('Hat'); // 방어구 선택 시 모자가 기본값
                        } else if (value === 'Accessory') {
                          setSubCategory('Face Accessory'); // 장신구 선택 시 얼굴장식이 기본값
                        } else if (value === 'One-Handed Weapon') {
                          setSubCategory('One-Handed Sword'); // 한손 무기 선택 시 한손검이 기본값
                        } else if (value === 'Two-Handed Weapon') {
                          setSubCategory('Two-Handed Sword'); // 두손 무기 선택 시 두손검이 기본값
                        } else if (value === 'Secondary Weapon') {
                          setSubCategory('Spellbook'); // 보조 무기 선택 시 주문서가 기본값
                        } else if (value === 'Character') {
                          setSubCategory('Hair'); // 성형/헤어/피부 선택 시 헤어가 기본값
                        } else {
                          setSubCategory('');
                        }
                      }}
                      placeholder="중분류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.equipCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
                
                {category === 'Armor' && (
                  <Col xs={24} sm={12} md={6}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="소분류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.armorSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
                
                {category === 'Accessory' && (
                  <Col xs={24} sm={12} md={6}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
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
                
                {category === 'One-Handed Weapon' && (
                  <Col xs={24} sm={12} md={6}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="한손 무기 종류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.oneHandedWeaponSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
                
                {category === 'Two-Handed Weapon' && (
                  <Col xs={24} sm={12} md={6}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="두손 무기 종류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.twoHandedWeaponSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
                
                {category === 'Secondary Weapon' && (
                  <Col xs={24} sm={12} md={6}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="보조 무기 종류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.secondaryWeaponSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
                
                {category === 'Character' && (
                  <Col xs={24} sm={12} md={6}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="종류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.characterSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
              </Row>
            </Col>
            
            <Col span={24}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={16} md={12}>
                  <Search
                    placeholder="아이템 이름을 검색하세요 (엔터: 전체 검색)"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onSearch={handleFullSearch}
                  />
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={sortBy}
                    onChange={handleSortChange}
                    placeholder="정렬 기준"
                  >
                    <Option value="category">카테고리순</Option>
                    <Option value="name">이름순</Option>
                    <Option value="price">가격순</Option>
                  </Select>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <ItemList items={paginatedItems} loading={loading} />
        </div>

        {!loading && filteredItems.length > 0 && (
          <div className="flex justify-center mt-8">
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
      </div>
    </MainLayout>
  );
}