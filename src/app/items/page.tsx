'use client';

import { useState, useCallback, useEffect } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, App, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { ItemList } from '@/components/items/item-list';
import { MapleItem } from '@/types/maplestory';
import { loadItems } from '@/lib/cdn-data-loader';
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
  ],
  useSubCategories: [
    { value: 'Recovery', label: '회복' },
    { value: 'Special', label: '특수' },
    { value: 'Buff', label: '버프' },
    { value: 'Scroll', label: '주문서' },
    { value: 'Pet Use', label: '펫 전용' },
    { value: 'Mastery Book', label: '마스터리북' },
    { value: 'Cure', label: '치료' },
    { value: 'Monster Riding', label: '몬스터 라이딩' },
    { value: 'Teleport', label: '순간이동' },
    { value: 'Weather', label: '날씨' },
    { value: 'Transformation', label: '변신' },
    { value: 'Summoning Bag', label: '소환가방' },
  ],
  setupSubCategories: [
    { value: 'Chair', label: '의자' },
    { value: 'Totem', label: '토템' },
    { value: 'Jukebox', label: '음악상자' },
    { value: 'Trap', label: '함정' },
    { value: 'Extractor', label: '채집기' },
    { value: 'Familiar', label: '패밀리어' },
    { value: 'Android', label: '안드로이드' },
    { value: 'Mechanical Heart', label: '기계심장' },
    { value: 'Installation', label: '설치물' },
  ],
  etcSubCategories: [
    { value: 'Potion Material', label: '포션 재료' },
    { value: 'Mineral Ore', label: '광물 원석' },
    { value: 'Jewel Ore', label: '보석 원석' },
    { value: 'Crystal Ore', label: '크리스탈 원석' },
    { value: 'Refined Ore', label: '정제된 원석' },
    { value: 'Recipe', label: '레시피' },
    { value: 'Smelting', label: '제련' },
    { value: 'Monster Card', label: '몬스터 카드' },
    { value: 'Quest Item', label: '퀘스트 아이템' },
    { value: 'Harvesting', label: '채집' },
    { value: 'Seed', label: '씨앗' },
    { value: 'Coin', label: '코인' },
    { value: 'Letter', label: '편지' },
    { value: 'Invitation', label: '초대장' },
    { value: 'Ticket', label: '티켓' },
  ],
  cashSubCategories: [
    { value: 'Pet', label: '펫' },
    { value: 'Pet Equipment', label: '펫 장비' },
    { value: 'Package', label: '패키지' },
    { value: 'Weather', label: '날씨' },
    { value: 'Megaphone', label: '확성기' },
    { value: 'Upgrade', label: '강화' },
    { value: 'Special', label: '특수' },
    { value: 'Decoration', label: '장식' },
    { value: 'Premium', label: '프리미엄' },
    { value: 'Label Ring', label: '라벨링' },
    { value: 'Protect', label: '보호' },
    { value: 'Skill', label: '스킬' },
    { value: 'Beauty', label: '뷰티' },
    { value: 'Karma', label: '카르마' },
    { value: 'Cube', label: '큐브' },
    { value: 'Familiar', label: '패밀리어' },
  ],
  cashPetSubCategories: [
    { value: '일반펫', label: '일반펫' },
    { value: '자석펫', label: '자석펫' },
  ],
};

export default function ItemsPageSimple() {
  const { message } = App.useApp();
  const [allItems, setAllItems] = useState<any>({});
  const [items, setItems] = useState<MapleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MapleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [overallCategory, setOverallCategory] = useState<string>('Equip');
  const [category, setCategory] = useState<string>('Accessory');
  const [subCategory, setSubCategory] = useState<string>('Face Accessory');
  const [subSubCategory, setSubSubCategory] = useState<string>('');
  const [subSubSubCategory, setSubSubSubCategory] = useState<string>('');
  const pageSize = 24;

  // CDN에서 전체 데이터 로드 (한 번만)
  useEffect(() => {
    const loadAllData = async () => {
      setDataLoading(true);
      try {
        console.log('📥 CDN에서 전체 아이템 데이터 로딩...');
        const itemsData = await loadItems();
        setAllItems(itemsData);
        console.log(`✅ ${Object.keys(itemsData).length}개 아이템 로드 완료`);
      } catch (error) {
        console.error('❌ 데이터 로드 실패:', error);
        message.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setDataLoading(false);
      }
    };

    loadAllData();
  }, [message]);

  // 카테고리별 필터링
  useEffect(() => {
    if (dataLoading || Object.keys(allItems).length === 0) return;

    setLoading(true);
    try {
      console.log(`🔍 ${overallCategory} 카테고리 필터링 중...`);
      
      // 전체 데이터에서 해당 카테고리만 필터링
      const filteredData = Object.values(allItems).filter((item: any) => {
        return item.typeInfo?.overallCategory === overallCategory;
      });

      console.log(`📊 ${overallCategory}: ${filteredData.length}개 아이템 발견`);

      // MapleItem 형식으로 변환
      const convertedItems = filteredData.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.typeInfo?.category || '',
        subcategory: item.typeInfo?.subCategory || '',
        description: item.description || '',
        icon: `https://maplestory.io/api/KMS/389/item/${item.id}/icon`,
        cash: false,
        price: 0,
      })) as MapleItem[];

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

    // 2차 카테고리 필터
    if (category && overallCategory === 'Equip') {
      filtered = filtered.filter(item => item.category === category);
    } else if (category && overallCategory !== 'Equip') {
      filtered = filtered.filter(item => item.category === category);
    }

    // 3차 카테고리 필터 (세부 분류)
    if (subCategory) {
      filtered = filtered.filter(item => item.subcategory === subCategory);
    }

    // 정렬
    filtered.sort((a, b) => {
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
    setSubSubCategory('');
    setSubSubSubCategory('');
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

  // 로딩 화면
  if (dataLoading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" spinning={true} tip="CDN에서 데이터를 로딩하는 중...">
            <div style={{ minHeight: '200px' }} />
          </Spin>
          <div style={{ marginTop: '20px', color: '#666' }}>
            109,945개의 아이템 데이터를 다운로드하고 있습니다...
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
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={overallCategory}
                    onChange={setOverallCategory}
                    placeholder="대분류 선택"
                  >
                    {ITEM_CATEGORIES.overallCategories.map(cat => (
                      <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                    ))}
                  </Select>
                </Col>
                
                {/* 2차 분류 */}
                {overallCategory === 'Equip' && (
                  <Col xs={24} sm={12} md={8}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category}
                      onChange={(value) => {
                        setCategory(value);
                        setSubCategory(''); // 상위 카테고리 변경시 하위 초기화
                      }}
                      placeholder="2차 분류 선택"
                    >
                      {ITEM_CATEGORIES.equipCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
                {overallCategory === 'Use' && (
                  <Col xs={24} sm={12} md={8}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category}
                      onChange={setCategory}
                      placeholder="소비 아이템 분류"
                    >
                      {ITEM_CATEGORIES.useSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
                {overallCategory === 'Setup' && (
                  <Col xs={24} sm={12} md={8}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category}
                      onChange={setCategory}
                      placeholder="설치 아이템 분류"
                    >
                      {ITEM_CATEGORIES.setupSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
                {overallCategory === 'Etc' && (
                  <Col xs={24} sm={12} md={8}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category}
                      onChange={setCategory}
                      placeholder="기타 아이템 분류"
                    >
                      {ITEM_CATEGORIES.etcSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
                {overallCategory === 'Cash' && (
                  <Col xs={24} sm={12} md={8}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category}
                      onChange={(value) => {
                        setCategory(value);
                        setSubCategory(''); // 펫 선택시 하위 초기화
                      }}
                      placeholder="캐시 아이템 분류"
                    >
                      {ITEM_CATEGORIES.cashSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}
              </Row>
            </Col>

            {/* 3차 분류 (장비 세부 분류) */}
            {overallCategory === 'Equip' && category && (
              <Col span={24}>
                <Row gutter={[16, 16]} align="middle">
                  {category === 'Armor' && (
                    <Col xs={24} sm={12} md={8}>
                      <Select
                        style={{ width: '100%' }}
                        size="large"
                        value={subCategory}
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
                  {category === 'Accessory' && (
                    <Col xs={24} sm={12} md={8}>
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
                    <Col xs={24} sm={12} md={8}>
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
                    <Col xs={24} sm={12} md={8}>
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
                    <Col xs={24} sm={12} md={8}>
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
                </Row>
              </Col>
            )}

            {/* 펫 세부 분류 (캐시 > 펫) */}
            {overallCategory === 'Cash' && category === 'Pet' && (
              <Col span={24}>
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={12} md={8}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="펫 종류"
                      allowClear
                    >
                      {ITEM_CATEGORIES.cashPetSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                </Row>
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
                    <Option value="name">이름순</Option>
                    <Option value="category">카테고리순</Option>
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
            {/* 카테고리 경로 표시 */}
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
                    {category === 'One-Handed Weapon' && ITEM_CATEGORIES.oneHandedWeaponSubCategories.find(cat => cat.value === subCategory)?.label}
                    {category === 'Two-Handed Weapon' && ITEM_CATEGORIES.twoHandedWeaponSubCategories.find(cat => cat.value === subCategory)?.label}
                    {category === 'Secondary Weapon' && ITEM_CATEGORIES.secondaryWeaponSubCategories.find(cat => cat.value === subCategory)?.label}
                    {category === 'Pet' && ITEM_CATEGORIES.cashPetSubCategories.find(cat => cat.value === subCategory)?.label}
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
          <ItemList items={paginatedItems} loading={loading} />
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
      </div>
    </MainLayout>
  );
}