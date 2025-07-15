'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, App, Spin, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { ItemList } from '@/components/items/item-list';
import { ItemDetailModal } from '@/components/items/item-detail-modal';
import { MapleItem } from '@/types/maplestory';
import { mapleAPI } from '@/lib/api';
import { useTheme } from '@/components/providers/theme-provider';
import { useItemsByCategory, useInfiniteItemsByCategory, useSearchItems, useSearchItemsInCategory } from '@/hooks/useMapleData';

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
    { value: 'Character', label: '캐릭터 외형' },
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
  characterSubCategories: [
    { value: 'Face', label: '성형 (얼굴)' },
    { value: 'Hair', label: '헤어' },
    { value: 'Head', label: '피부' },
  ],
  oneHandedWeaponSubCategories: [
    { value: 'One-Handed Sword', label: '한손검' },
    { value: 'One-Handed Axe', label: '한손도끼' },
    { value: 'One-Handed Blunt Weapon', label: '한손둔기' },
    { value: 'Dagger', label: '단검' },
    { value: 'Katara', label: '카타라' },
    { value: 'Cane', label: '케인' },
    { value: 'Wand', label: '완드' },
    { value: 'Staff', label: '스태프' },
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
    { value: 'Gun', label: '총' },
    { value: 'Dual Bowgun', label: '듀얼보우건' },
    { value: 'Hand Cannon', label: '핸드캐논' },
    { value: 'Arm Cannon', label: '암캐논' },
  ],
  secondaryWeaponSubCategories: [
    { value: 'Arrow Fletching', label: '화살깃' },
    { value: 'Arrowhead', label: '화살촉' },
    { value: 'Ballast', label: '밸러스트' },
    { value: 'Bow Thimble', label: '골무' },
    { value: 'Card', label: '카드' },
    { value: 'Charges', label: '차지' },
    { value: 'Charm', label: '부적' },
    { value: 'Chess Piece', label: '체스말' },
    { value: 'Core Controller', label: '코어 컨트롤러' },
    { value: 'Dagger Scabbard', label: '단검 집' },
    { value: 'Document', label: '문서' },
    { value: 'Fox Marble', label: '여우 구슬' },
    { value: 'Iron Chain', label: '쇠사슬' },
    { value: 'Jewel', label: '보석' },
    { value: 'Magic Arrow', label: '마법 화살' },
    { value: 'Magic Marble', label: '마법 구슬' },
    { value: 'Magnum', label: '매그넘' },
    { value: 'Mass', label: '미사' },
    { value: 'Medal', label: '메달' },
    { value: "Nova's Essence", label: '노바의 정수' },
    { value: 'Orb', label: '오브' },
    { value: 'Path', label: '패스' },
    { value: 'Powder Keg', label: '화약통' },
    { value: 'Relic', label: '유물' },
    { value: 'Rosary', label: '묵주' },
    { value: 'Soul Ring', label: '소울링' },
    { value: 'Spellbook', label: '마법서' },
    { value: 'Transmitter', label: '송신기' },
    { value: 'Wings', label: '날개' },
    { value: 'Wrist Band', label: '손목밴드' },
  ],
  useSubCategories: [
    { value: 'Consumable', label: '소비' },
    { value: 'Special Scroll', label: '특수 주문서' },
    { value: 'Armor Scroll', label: '방어구 주문서' },
    { value: 'Weapon Scroll', label: '무기 주문서' },
    { value: 'Projectile', label: '투사체' },
    { value: 'Character Modification', label: '성형/변경' },
    { value: 'Tablet', label: '태블릿' },
    { value: 'Recipe', label: '제작서' },
    { value: 'Monster/Familiar', label: '몬스터/펫' },
    { value: 'Other', label: '기타' },
  ],
  // 소비재 하위 분류
  consumableSubCategories: [
    { value: 'Potion', label: '포션' },
    { value: 'Food and Drink', label: '음식/음료' },
    { value: 'EXP Potion', label: 'EXP 포션' },
    { value: 'Pet Food', label: '펫 사료' },
    { value: 'Status Cure', label: '상태 회복' },
    { value: 'Teleport Item', label: '이동 아이템' },
    { value: 'Transformation', label: '변신' },
    { value: 'Equipment Box', label: '장비 상자' },
    { value: 'Consumable', label: '일반 소비재' },
  ],
  // 특수 주문서 하위 분류
  specialScrollSubCategories: [
    { value: 'Potential Scroll', label: '잠재능력 주문서' },
    { value: 'Bonus Potential Scroll', label: '에디셔널 잠재능력 주문서' },
    { value: 'Chaos Scroll', label: '혼돈의 주문서' },
    { value: 'Clean Slate Scroll', label: '복구 주문서' },
    { value: 'Innocence Scroll', label: '이노센트 주문서' },
    { value: 'Awakening Stamp', label: '각성인장' },
    { value: 'Equip Enhancement', label: '장비 강화' },
    { value: 'Slot Carver', label: '슬롯 조각칼' },
  ],
  // 방어구 주문서 하위 분류
  armorScrollSubCategories: [
    { value: 'Armor', label: '방어구' },
    { value: 'Accessory', label: '장신구' },
    { value: 'Helmet', label: '헬멧' },
    { value: 'Topwear', label: '상의' },
    { value: 'Bottomwear', label: '하의' },
    { value: 'Overall', label: '원피스' },
    { value: 'Shoes', label: '신발' },
    { value: 'Gloves', label: '장갑' },
    { value: 'Cape', label: '망토' },
    { value: 'Shield', label: '방패' },
    { value: 'Ring', label: '반지' },
    { value: 'Pendant', label: '펜던트' },
    { value: 'Belt', label: '벨트' },
    { value: 'Earrings', label: '귀걸이' },
    { value: 'Eye', label: '눈장식' },
    { value: 'Face', label: '얼굴장식' },
    { value: 'Shoulder', label: '어깨장식' },
  ],
  // 무기 주문서 하위 분류
  weaponScrollSubCategories: [
    { value: 'One-Handed Sword', label: '한손검' },
    { value: 'One-Handed Axe', label: '한손도끼' },
    { value: 'One-Handed Blunt Weapon', label: '한손둔기' },
    { value: 'Dagger', label: '단검' },
    { value: 'Katara', label: '카타라' },
    { value: 'Two-Handed Sword', label: '두손검' },
    { value: 'Two-Handed Axe', label: '두손도끼' },
    { value: 'Two-Handed Blunt', label: '두손둔기' },
    { value: 'Spear', label: '창' },
    { value: 'Pole Arm', label: '폴암' },
    { value: 'Bow', label: '활' },
    { value: 'Crossbow', label: '석궁' },
    { value: 'Claw', label: '아대' },
    { value: 'Knuckle', label: '너클' },
    { value: 'Gun', label: '총' },
    { value: 'Staff', label: '스태프' },
    { value: 'Wand', label: '완드' },
    { value: 'Cane', label: '케인' },
  ],
  // 투사체 하위 분류
  projectileSubCategories: [
    { value: 'Arrow', label: '화살' },
    { value: 'Thrown', label: '표창' },
    { value: 'Crossbow Bolt', label: '석궁볼트' },
    { value: 'Bullet', label: '불릿' },
  ],
  // 태블릿 하위 분류
  tabletSubCategories: [
    { value: 'Armor', label: '방어구' },
    { value: 'Accessory', label: '장신구' },
    { value: 'One-Handed Weapon', label: '한손 무기' },
    { value: 'Two-Handed Weapon', label: '두손 무기' },
  ],
  // 제작서 하위 분류
  recipeSubCategories: [
    { value: 'Smithing Recipe', label: '제작 레시피' },
  ],
  // 몬스터/펫 하위 분류
  monsterFamiliarSubCategories: [
    { value: 'Monster Card', label: '몬스터 카드' },
  ],
  // 기타 하위 분류 (Use > Other)
  useOtherSubCategories: [
    { value: 'Summoning Sack', label: '소환 보따리' },
    { value: 'Synergy Machine', label: '시너지 머신' },
    { value: 'Wedding', label: '결혼' },
    { value: 'Monster Taming', label: '몬스터 테이밍' },
    { value: 'Lie Detector', label: '거짓말탐지기' },
  ],
  setupSubCategories: [
    { value: 'Other', label: '기타' },
    { value: 'Evolution Lab', label: '에볼루션 랩' },
  ],
  // 설치 - 기타 하위 분류
  setupOtherSubCategories: [
    { value: 'Chair', label: '의자' },
    { value: 'Title', label: '칭호' },
    { value: 'Other', label: '기타' },
    { value: 'Decoration', label: '장식품' },
    { value: 'Container', label: '컨테이너' },
    { value: 'Extractor', label: '추출기' },
  ],
  // 설치 - 에볼루션 랩 하위 분류
  setupEvolutionLabSubCategories: [
    { value: 'Core', label: '코어' },
    { value: 'Mission', label: '미션' },
  ],
  etcSubCategories: [
    { value: 'Other', label: '기타' },
    { value: 'Crafting', label: '제작 재료' },
    { value: 'Cash Shop', label: '캐시샵' },
  ],
  // Etc - Other 하위 분류
  etcOtherSubCategories: [
    { value: 'Monster Drop', label: '몬스터 드랍' },
    { value: 'Quest Item', label: '퀘스트 아이템' },
    { value: 'Cosmetic', label: '코스메틱' },
    { value: 'Minigame', label: '미니게임' },
    { value: 'Other', label: '기타' },
    { value: 'Pet Command', label: '펫 명령' },
    { value: 'Book', label: '책' },
    { value: 'Coin', label: '코인' },
    { value: 'Container', label: '컨테이너' },
    { value: 'Item Pot', label: '아이템 팟' },
    { value: 'EXP Ticket', label: 'EXP 티켓' },
    { value: 'Event Item', label: '이벤트 아이템' },
  ],
  // Etc - Crafting 하위 분류
  etcCraftingSubCategories: [
    { value: 'Mineral Ore', label: '광물 원석' },
    { value: 'Mineral Processed', label: '가공된 광물' },
    { value: 'Rare Ore', label: '희귀 원석' },
    { value: 'Rare Processed  Ore', label: '가공된 희귀 원석' },
    { value: 'Crafting Item', label: '제작 아이템' },
    { value: 'Herb', label: '약초' },
    { value: 'Herb Oil', label: '약초 오일' },
    { value: 'Maker', label: '메이커' },
  ],
  // Etc - Cash Shop 하위 분류
  etcCashShopSubCategories: [
    { value: 'Reward Item', label: '보상 아이템' },
    { value: 'Wedding', label: '결혼' },
    { value: 'Potential Lock', label: '잠재능력 잠금' },
    { value: 'Fusion', label: '융합' },
    { value: 'Coupon', label: '쿠폰' },
  ],
  cashSubCategories: [
    { value: 'Accessory', label: '액세서리' },
    { value: 'Appearance', label: '외형' },
    { value: 'Character Modification', label: '캐릭터 변경' },
    { value: 'Equipment Modification', label: '장비 변경' },
    { value: 'Free Market', label: '자유시장' },
    { value: 'Messenger and Social', label: '메신저 및 소셜' },
    { value: 'Miscellaneous', label: '기타' },
    { value: 'Pet', label: '펫' },
    { value: 'Random Reward', label: '랜덤 보상' },
    { value: 'Time Saver', label: '시간 단축' },
    { value: 'Weapon', label: '무기' },
  ],
  cashAccessorySubCategories: [
    { value: 'Pendant', label: '펜던트' },
  ],
  cashAppearanceSubCategories: [
    { value: 'Cosmetic Lens', label: '컬러렌즈' },
    { value: 'Ear', label: '귀' },
    { value: 'Effect', label: '이펙트' },
    { value: 'Face Coupon', label: '얼굴 쿠폰' },
    { value: 'Facial Expression', label: '표정' },
    { value: 'Hair Color Coupon', label: '헤어 컬러 쿠폰' },
    { value: 'Hair Coupon', label: '헤어 쿠폰' },
    { value: 'Skin Coupon', label: '피부 쿠폰' },
  ],
  cashCharacterModificationSubCategories: [
    { value: 'Circulator', label: '서큘레이터' },
    { value: 'EXP Coupon', label: 'EXP 쿠폰' },
    { value: 'Entry Pass', label: '입장권' },
    { value: 'Inventory Slot', label: '인벤토리 슬롯' },
    { value: 'Mastery Book', label: '마스터리북' },
    { value: 'Other', label: '기타' },
    { value: 'Protection', label: '보호' },
    { value: 'SP/AP Modification', label: 'SP/AP 변경' },
    { value: 'Wedding', label: '결혼' },
  ],
  cashEquipmentModificationSubCategories: [
    { value: 'Miracle Cube', label: '미라클 큐브' },
    { value: 'Other', label: '기타' },
    { value: 'Scroll', label: '주문서' },
    { value: 'Trade', label: '거래' },
  ],
  cashFreeMarketSubCategories: [
    { value: 'Hired Merchant', label: '고용상인' },
    { value: 'Other', label: '기타' },
    { value: 'Pet', label: '펫' },
    { value: 'Store Permit', label: '상점 허가증' },
  ],
  cashMessengerSocialSubCategories: [
    { value: 'Character Effect', label: '캐릭터 이펙트' },
    { value: 'Kite', label: '연' },
    { value: 'Messageboard', label: '메시지보드' },
    { value: 'Messenger', label: '메신저' },
    { value: 'Note', label: '노트' },
    { value: 'Song', label: '노래' },
    { value: 'Weather Effect', label: '날씨 이펙트' },
  ],
  cashMiscellaneousSubCategories: [
    { value: 'Other', label: '기타' },
  ],
  cashPetSubCategories: [
    { value: 'Pet Food', label: '펫 사료' },
    { value: 'Pet Use', label: '펫 용품' },
  ],
  cashRandomRewardSubCategories: [
    { value: 'Exchange Coupon', label: '교환 쿠폰' },
    { value: 'Gachapon', label: '가챠폰' },
    { value: 'Special Item', label: '특수 아이템' },
  ],
  cashTimeSaverSubCategories: [
    { value: 'Item Store', label: '아이템 상점' },
    { value: 'Package', label: '패키지' },
    { value: 'Teleport Rock', label: '텔레포트 록' },
  ],
  cashWeaponSubCategories: [
    { value: 'Thrown', label: '투척' },
  ],
};

export default function ItemsPage() {
  const { message } = App.useApp();
  const { theme: currentTheme } = useTheme();
  const [filteredItems, setFilteredItems] = useState<MapleItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('category');
  const [overallCategory, setOverallCategory] = useState<string>('Equip');
  const [category, setCategory] = useState<string>('Accessory');
  const [subCategory, setSubCategory] = useState<string>('Face Accessory');
  const [selectedItem, setSelectedItem] = useState<MapleItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pageJumpLoading, setPageJumpLoading] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchInput, setSearchInput] = useState(''); // 검색 입력값
  const pageSize = 24;
  const batchSize = 500;

  // React Query 무한 쿼리로 아이템 데이터 가져오기
  const {
    data: infiniteData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteItemsByCategory(
    overallCategory,
    category,
    subCategory,
    batchSize, // batchSize
    !!(overallCategory && category && subCategory) // enabled 조건
  );

  // 검색용 React Query 훅
  const {
    data: searchResults = [],
    isLoading: isSearchLoading,
    error: searchError
  } = useSearchItemsInCategory(
    overallCategory,
    category,
    subCategory,
    searchQuery,
    isSearchMode && !!searchQuery.trim()
  );

  // 모든 페이지의 아이템을 하나의 배열로 합치기 (useMemo로 최적화)
  const items = useMemo(() => {
    if (isSearchMode && searchResults.length > 0) {
      return searchResults;
    }
    if (!infiniteData?.pages) return [];
    return infiniteData.pages.flat();
  }, [infiniteData?.pages, isSearchMode, searchResults]);

  // React Query 데이터 로딩 완료 시 처리 (한 번만 실행)
  useEffect(() => {
    if (items.length > 0 && !isLoading) {
      console.log(`✅ React Query 로드 완료: ${items.length}개`);
      message.success(`${items.length}개의 아이템을 불러왔습니다.`);
    }
  }, [items.length, isLoading, category, subCategory]);

  // React Query 에러 처리
  useEffect(() => {
    if (error) {
      console.error('❌ React Query 아이템 데이터 로드 실패:', error);
      message.error('아이템 데이터를 불러오는데 실패했습니다. 다시 시도해주세요.');
    }
  }, [error]);

  // 검색 에러 처리
  useEffect(() => {
    if (searchError) {
      console.error('❌ React Query 검색 실패:', searchError);
      message.error('검색에 실패했습니다. 다시 시도해주세요.');
    }
  }, [searchError]);

  // 검색 결과 알림
  useEffect(() => {
    if (isSearchMode && !isSearchLoading && searchResults.length >= 0) {
      const categoryText = `${category} > ${subCategory}`;
      if (searchResults.length === 0) {
        message.info(`"${searchQuery}" 검색 결과가 없습니다. (${categoryText})`);
      } else {
        message.success(`"${searchQuery}" 검색 결과: ${searchResults.length}개 (${categoryText})`);
      }
    }
  }, [isSearchMode, isSearchLoading, searchResults.length, searchQuery, category, subCategory]);

  // 카테고리별 빈 데이터 알림 (조건 강화로 중복 방지)
  useEffect(() => {
    if (!isLoading && !isFetchingNextPage && items.length === 0 && overallCategory && category && subCategory) {
      message.info(`${category} > ${subCategory} 카테고리에 아이템이 없습니다.`);
    }
  }, [isLoading, isFetchingNextPage, items.length, category, subCategory, overallCategory]);

  // API 검색 함수 (선택한 카테고리 내에서만 검색)
  const searchItemsFromAPI = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      // 검색어가 비어있으면 검색 모드 해제
      setIsSearchMode(false);
      return [];
    }

    try {
      setLoading(true);
      setIsSearchMode(true);
      console.log('🔍 API 검색 시작...', { searchTerm, overallCategory, category, subCategory });
      
      const params = {
        overallCategory: overallCategory,
        category: category,
        subCategory: subCategory,
        searchFor: searchTerm.trim(),
        count: 200 // 검색 결과는 200개까지
      };
      
      const searchResults = await mapleAPI.getItemsByCategory(params);
      console.log(`✅ 검색 완료: ${searchResults.length}개`);
      
      const categoryText = `${overallCategory} > ${category} > ${subCategory}`;
      if (searchResults.length === 0) {
        message.info(`"${searchTerm}" 검색 결과가 없습니다. (${categoryText})`);
      } else {
        message.success(`"${searchTerm}" 검색 결과: ${searchResults.length}개 (${categoryText})`);
      }
      
      return searchResults;
    } catch (error) {
      console.error('❌ API 검색 실패:', error);
      message.error('검색에 실패했습니다. 다시 시도해주세요.');
      return [];
    } finally {
      setLoading(false);
    }
  };


  // 페이지 점프 시 필요한 데이터 로드
  const loadDataForPage = async (targetPage: number) => {
    const requiredItems = targetPage * pageSize;
    let currentItems = items.length;
    
    if (requiredItems <= currentItems) {
      // 이미 충분한 데이터가 있으면 바로 페이지 변경
      return true;
    }
    
    if (!hasNextPage) {
      // 더 이상 로드할 데이터가 없으면 현재 데이터로 처리
      console.log('📄 더 이상 로드할 데이터가 없습니다.');
      return true;
    }
    
    try {
      setPageJumpLoading(true);
      console.log(`🚀 페이지 ${targetPage} 점프를 위한 데이터 로드 시작...`);
      console.log(`필요한 아이템: ${requiredItems}개, 현재 아이템: ${currentItems}개`);
      
      // 필요한 만큼 데이터를 배치로 로드 (최대 10회 시도로 무한 루프 방지)
      let attempts = 0;
      const maxAttempts = 10;
      
      while (currentItems < requiredItems && hasNextPage && attempts < maxAttempts) {
        console.log(`📦 다음 배치 로드 중... (현재: ${currentItems}개, 시도: ${attempts + 1}/${maxAttempts})`);
        await fetchNextPage();
        attempts++;
        
        // 로딩 후 잠시 대기하고 현재 아이템 수 다시 확인
        await new Promise(resolve => setTimeout(resolve, 200));
        currentItems = items.length; // 최신 아이템 수로 업데이트
      }
      
      setPageJumpLoading(false);
      console.log(`✅ 페이지 ${targetPage} 데이터 로드 완료: ${items.length}개`);
      return true;
      
    } catch (error) {
      console.error('❌ 페이지 점프 데이터 로드 실패:', error);
      message.error('페이지 데이터를 불러오는데 실패했습니다.');
      setPageJumpLoading(false);
      return false;
    }
  };

  // React Query가 자동으로 초기 데이터를 로드하므로 별도 useEffect 불필요


  // 필터링 함수
  const applyFilters = (pageReset = false) => {
    let filtered = [...items];

    // 검색 모드가 아닐 때만 클라이언트 필터링 적용
    if (!isSearchMode) {
      // 검색 필터 (검색 모드가 아닐 때는 로컬 필터링)
      if (searchQuery.trim()) {
        filtered = filtered.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
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
    
    // 페이지 리셋이 필요한 경우에만 (검색어나 카테고리 변경 시)
    if (pageReset) {
      setCurrentPage(1);
    }
  };

  // 정렬 및 카테고리 변경 시 필터링 (페이지 리셋 포함)
  useEffect(() => {
    applyFilters(true);
  }, [sortBy, category, subCategory, overallCategory, isSearchMode]);
  
  // 아이템 데이터 변경 시 필터링 (페이지 리셋 없음)
  useEffect(() => {
    if (items.length > 0) {
      applyFilters(false);
    }
  }, [items, searchQuery]);

  // 대분류 변경시 하위 카테고리 초기화
  useEffect(() => {
    // 필터링된 아이템 리스트 초기화 (React Query가 자동으로 새 데이터 로드)
    setFilteredItems([]);
    
    // 대분류별로 기본 카테고리 설정 (일괄 처리)
    const updateCategories = () => {
      if (overallCategory === 'Equip') {
        setCategory('Accessory');
        setSubCategory('Face Accessory');
      } else if (overallCategory === 'Use') {
        setCategory('Consumable');
        setSubCategory('Potion');
      } else if (overallCategory === 'Setup') {
        setCategory('Other');
        setSubCategory('Chair');
      } else if (overallCategory === 'Etc') {
        setCategory('Other');
        setSubCategory('Monster Drop');
      } else if (overallCategory === 'Cash') {
        setCategory('Appearance');
        setSubCategory('Effect');
      } else {
        setCategory('');
        setSubCategory('');
      }
    };
    
    // 다음 틱에서 카테고리 업데이트 (상태 안정화)
    setTimeout(updateCategories, 0);
  }, [overallCategory]);

  // 수동 검색 핸들러 (React Query 사용)
  const handleManualSearch = async (value: string) => {
    setSearchQuery(value);
    
    if (value.trim()) {
      // React Query가 자동으로 검색 실행
      setIsSearchMode(true);
      console.log('🔍 React Query 검색 시작:', value);
    } else {
      // 검색어가 없으면 카테고리 기반 로드
      setIsSearchMode(false);
      refetch(); // React Query 리페치
    }
  };

  // 검색 입력 핸들러 (검색은 실행하지 않고 상태만 업데이트)
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Enter 키 핸들러
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleManualSearch(searchInput);
    }
  };

  // 검색 버튼 클릭 핸들러
  const handleSearchButtonClick = () => {
    handleManualSearch(searchInput);
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
  if ((isLoading || isSearchLoading) && items.length === 0) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" spinning={true} tip="아이템 데이터를 로딩하는 중...">
            <div style={{ minHeight: '200px' }} />
          </Spin>
          <div style={{ marginTop: '20px', color: '#666' }}>
            {category} &gt; {subCategory} 카테고리의 아이템을 로딩하고 있습니다...<br/>
            React Query를 사용하여 효율적으로 데이터를 캐싱합니다.
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
            📊 총 {items.length.toLocaleString()}개 아이템 로드됨 {hasNextPage && '(더 많은 데이터 로드 가능)'}
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
                      // 하위 카테고리는 useEffect에서 자동 설정됨
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
                      value={category}
                      onChange={(value) => {
                        setCategory(value);
                        // 2차 분류 변경 시 하위 카테고리를 첫 번째 옵션으로 설정
                        if (value === 'Accessory') {
                          setSubCategory('Face Accessory');
                        } else if (value === 'Armor') {
                          setSubCategory('Hat');
                        } else if (value === 'Two-Handed Weapon') {
                          setSubCategory('Two-Handed Sword');
                        } else if (value === 'One-Handed Weapon') {
                          setSubCategory('One-Handed Sword');
                        } else if (value === 'Secondary Weapon') {
                          setSubCategory('Arrow Fletching');
                        } else if (value === 'Character') {
                          setSubCategory('Face');
                        } else if (value === 'Mount') {
                          setSubCategory('Mount');
                        } else if (value === 'Other') {
                          setSubCategory('Android');
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
                      value={category}
                      onChange={(value) => {
                        setCategory(value);
                        // 소비 아이템 2차 분류별 기본 하위 카테고리 설정
                        if (value === 'Consumable') {
                          setSubCategory('Potion');
                        } else if (value === 'Special Scroll') {
                          setSubCategory('Potential Scroll');
                        } else if (value === 'Armor Scroll') {
                          setSubCategory('Armor');
                        } else if (value === 'Weapon Scroll') {
                          setSubCategory('One-Handed Sword');
                        } else if (value === 'Projectile') {
                          setSubCategory('Thrown');
                        } else if (value === 'Character Modification') {
                          setSubCategory('Mastery Book');
                        } else if (value === 'Tablet') {
                          setSubCategory('Armor');
                        } else if (value === 'Recipe') {
                          setSubCategory('Smithing Recipe');
                        } else if (value === 'Monster/Familiar') {
                          setSubCategory('Monster Card');
                        } else if (value === 'Other') {
                          setSubCategory('Summoning Sack');
                        } else {
                          setSubCategory(value);
                        }
                      }}
                    >
                      {ITEM_CATEGORIES.useSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 소비아이템 3차 분류 */}
                {overallCategory === 'Use' && category && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={(value) => setSubCategory(value)}
                      placeholder="세부 분류"
                    >
                      {category === 'Consumable' && ITEM_CATEGORIES.consumableSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Special Scroll' && ITEM_CATEGORIES.specialScrollSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Armor Scroll' && ITEM_CATEGORIES.armorScrollSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Weapon Scroll' && ITEM_CATEGORIES.weaponScrollSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Projectile' && ITEM_CATEGORIES.projectileSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Tablet' && ITEM_CATEGORIES.tabletSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Recipe' && ITEM_CATEGORIES.recipeSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Monster/Familiar' && ITEM_CATEGORIES.monsterFamiliarSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Other' && ITEM_CATEGORIES.useOtherSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Character Modification' && (
                        <Option value="Mastery Book">마스터리북</Option>
                      )}
                    </Select>
                  </Col>
                )}

                {/* 설치아이템 2차 분류 */}
                {overallCategory === 'Setup' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category}
                      onChange={(value) => {
                        setCategory(value);
                        // 설치 아이템 2차 분류별 기본 하위 카테고리 설정
                        if (value === 'Other') {
                          setSubCategory('Chair');
                        } else if (value === 'Evolution Lab') {
                          setSubCategory('Core');
                        } else {
                          setSubCategory(value);
                        }
                      }}
                      placeholder="설치 종류"
                    >
                      {ITEM_CATEGORIES.setupSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 설치아이템 3차 분류 */}
                {overallCategory === 'Setup' && category && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={(value) => setSubCategory(value)}
                      placeholder="세부 분류"
                    >
                      {category === 'Other' && ITEM_CATEGORIES.setupOtherSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Evolution Lab' && ITEM_CATEGORIES.setupEvolutionLabSubCategories.map(cat => (
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
                      value={category}
                      onChange={(value) => {
                        setCategory(value);
                        // 기타 아이템 2차 분류별 기본 하위 카테고리 설정
                        if (value === 'Other') {
                          setSubCategory('Monster Drop');
                        } else if (value === 'Crafting') {
                          setSubCategory('Mineral Ore');
                        } else if (value === 'Cash Shop') {
                          setSubCategory('Reward Item');
                        } else {
                          setSubCategory(value);
                        }
                      }}
                      placeholder="기타 종류"
                    >
                      {ITEM_CATEGORIES.etcSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 기타아이템 3차 분류 */}
                {overallCategory === 'Etc' && category && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={(value) => setSubCategory(value)}
                      placeholder="세부 분류"
                    >
                      {category === 'Other' && ITEM_CATEGORIES.etcOtherSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Crafting' && ITEM_CATEGORIES.etcCraftingSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                      {category === 'Cash Shop' && ITEM_CATEGORIES.etcCashShopSubCategories.map(cat => (
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
                      value={category}
                      onChange={(value) => {
                        setCategory(value);
                        // Cash 카테고리별 기본 서브카테고리 설정
                        if (value === 'Accessory') {
                          setSubCategory('Pendant');
                        } else if (value === 'Appearance') {
                          setSubCategory('Effect');
                        } else if (value === 'Character Modification') {
                          setSubCategory('Circulator');
                        } else if (value === 'Equipment Modification') {
                          setSubCategory('Miracle Cube');
                        } else if (value === 'Free Market') {
                          setSubCategory('Pet');
                        } else if (value === 'Messenger and Social') {
                          setSubCategory('Character Effect');
                        } else if (value === 'Miscellaneous') {
                          setSubCategory('Other');
                        } else if (value === 'Pet') {
                          setSubCategory('Pet Food');
                        } else if (value === 'Random Reward') {
                          setSubCategory('Exchange Coupon');
                        } else if (value === 'Time Saver') {
                          setSubCategory('Item Store');
                        } else if (value === 'Weapon') {
                          setSubCategory('Thrown');
                        } else {
                          setSubCategory('');
                        }
                      }}
                      placeholder="캐시 종류"
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
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="방어구 종류"
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
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="장신구 종류"
                    >
                      {ITEM_CATEGORIES.accessorySubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 두손 무기 */}
                {overallCategory === 'Equip' && category === 'Two-Handed Weapon' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="두손 무기 종류"
                    >
                      {ITEM_CATEGORIES.twoHandedWeaponSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 한손 무기 */}
                {overallCategory === 'Equip' && category === 'One-Handed Weapon' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="한손 무기 종류"
                    >
                      {ITEM_CATEGORIES.oneHandedWeaponSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 보조 무기 */}
                {overallCategory === 'Equip' && category === 'Secondary Weapon' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="보조 무기 종류"
                    >
                      {ITEM_CATEGORIES.secondaryWeaponSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐릭터 외형 */}
                {overallCategory === 'Equip' && category === 'Character' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="캐릭터 외형 종류"
                    >
                      {ITEM_CATEGORIES.characterSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 액세서리 */}
                {overallCategory === 'Cash' && category === 'Accessory' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="캐시 액세서리 종류"
                    >
                      {ITEM_CATEGORIES.cashAccessorySubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 외형 */}
                {overallCategory === 'Cash' && category === 'Appearance' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="외형 종류"
                    >
                      {ITEM_CATEGORIES.cashAppearanceSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 캐릭터 변경 */}
                {overallCategory === 'Cash' && category === 'Character Modification' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="캐릭터 변경 종류"
                    >
                      {ITEM_CATEGORIES.cashCharacterModificationSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 장비 변경 */}
                {overallCategory === 'Cash' && category === 'Equipment Modification' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="장비 변경 종류"
                    >
                      {ITEM_CATEGORIES.cashEquipmentModificationSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 자유시장 */}
                {overallCategory === 'Cash' && category === 'Free Market' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="자유시장 종류"
                    >
                      {ITEM_CATEGORIES.cashFreeMarketSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 메신저 및 소셜 */}
                {overallCategory === 'Cash' && category === 'Messenger and Social' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="메신저/소셜 종류"
                    >
                      {ITEM_CATEGORIES.cashMessengerSocialSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 기타 */}
                {overallCategory === 'Cash' && category === 'Miscellaneous' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="기타 종류"
                    >
                      {ITEM_CATEGORIES.cashMiscellaneousSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 펫 */}
                {overallCategory === 'Cash' && category === 'Pet' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="펫 종류"
                    >
                      {ITEM_CATEGORIES.cashPetSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 랜덤 보상 */}
                {overallCategory === 'Cash' && category === 'Random Reward' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="랜덤 보상 종류"
                    >
                      {ITEM_CATEGORIES.cashRandomRewardSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 시간 단축 */}
                {overallCategory === 'Cash' && category === 'Time Saver' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="시간 단축 종류"
                    >
                      {ITEM_CATEGORIES.cashTimeSaverSubCategories.map(cat => (
                        <Option key={cat.value} value={cat.value}>{cat.label}</Option>
                      ))}
                    </Select>
                  </Col>
                )}

                {/* 3차 분류 - 캐시 무기 */}
                {overallCategory === 'Cash' && category === 'Weapon' && (
                  <Col xs={24} sm={8} md={6} lg={4}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={subCategory}
                      onChange={setSubCategory}
                      placeholder="캐시 무기 종류"
                    >
                      {ITEM_CATEGORIES.cashWeaponSubCategories.map(cat => (
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
                    placeholder="아이템 이름을 검색하세요 (Enter 또는 검색 버튼 클릭)"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleSearchKeyPress}
                    onSearch={handleSearchButtonClick}
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
        <div 
          className="p-5 rounded-lg mb-6"
          style={{
            backgroundColor: currentTheme === 'dark' ? '#000000' : '#f3f4f6'
          }}
        >
          <span 
            className="font-semibold text-lg"
            style={{
              color: currentTheme === 'dark' ? '#d1d5db' : '#111827'
            }}
          >
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
                    {overallCategory === 'Equip' && category === 'Armor' && ITEM_CATEGORIES.armorSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Equip' && category === 'Accessory' && ITEM_CATEGORIES.accessorySubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Equip' && category === 'One-Handed Weapon' && ITEM_CATEGORIES.oneHandedWeaponSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Equip' && category === 'Two-Handed Weapon' && ITEM_CATEGORIES.twoHandedWeaponSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Equip' && category === 'Secondary Weapon' && ITEM_CATEGORIES.secondaryWeaponSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Equip' && category === 'Character' && ITEM_CATEGORIES.characterSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Accessory' && ITEM_CATEGORIES.cashAccessorySubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Appearance' && ITEM_CATEGORIES.cashAppearanceSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Character Modification' && ITEM_CATEGORIES.cashCharacterModificationSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Equipment Modification' && ITEM_CATEGORIES.cashEquipmentModificationSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Free Market' && ITEM_CATEGORIES.cashFreeMarketSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Messenger and Social' && ITEM_CATEGORIES.cashMessengerSocialSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Miscellaneous' && ITEM_CATEGORIES.cashMiscellaneousSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Pet' && ITEM_CATEGORIES.cashPetSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Random Reward' && ITEM_CATEGORIES.cashRandomRewardSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Time Saver' && ITEM_CATEGORIES.cashTimeSaverSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Cash' && category === 'Weapon' && ITEM_CATEGORIES.cashWeaponSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Use' && category === 'Consumable' && ITEM_CATEGORIES.consumableSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Use' && category === 'Special Scroll' && ITEM_CATEGORIES.specialScrollSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Use' && category === 'Armor Scroll' && ITEM_CATEGORIES.armorScrollSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Use' && category === 'Weapon Scroll' && ITEM_CATEGORIES.weaponScrollSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Use' && category === 'Projectile' && ITEM_CATEGORIES.projectileSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Use' && category === 'Tablet' && ITEM_CATEGORIES.tabletSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Use' && category === 'Recipe' && ITEM_CATEGORIES.recipeSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Use' && category === 'Monster/Familiar' && ITEM_CATEGORIES.monsterFamiliarSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Use' && category === 'Other' && ITEM_CATEGORIES.useOtherSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Use' && category === 'Character Modification' && '마스터리북'}
                    {overallCategory === 'Setup' && category === 'Other' && ITEM_CATEGORIES.setupOtherSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Setup' && category === 'Evolution Lab' && ITEM_CATEGORIES.setupEvolutionLabSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Etc' && category === 'Other' && ITEM_CATEGORIES.etcOtherSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Etc' && category === 'Crafting' && ITEM_CATEGORIES.etcCraftingSubCategories.find(cat => cat.value === subCategory)?.label}
                    {overallCategory === 'Etc' && category === 'Cash Shop' && ITEM_CATEGORIES.etcCashShopSubCategories.find(cat => cat.value === subCategory)?.label}
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
          <ItemList items={paginatedItems} loading={isLoading || isSearchLoading || pageJumpLoading || isFetchingNextPage} onItemClick={handleItemClick} />
          
          
        </div>

        {/* 페이지네이션 및 더 불러오기 */}
        {!isLoading && !isSearchLoading && filteredItems.length > 0 && (
          <div style={{ marginTop: '4px' }}>
            {/* 검색 모드일 때 안내 메시지 */}
            {isSearchMode && (
              <div style={{ textAlign: 'center', marginBottom: '16px', color: '#666' }}>
                🔍 검색 결과입니다. "{searchQuery}" - {category} > {subCategory} 카테고리 내에서 검색됨
                <br />
                <span style={{ fontSize: '12px' }}>검색어를 지우면 일반 모드로 돌아갑니다.</span>
              </div>
            )}
            
            {/* 검색 모드가 아닐 때만 페이지네이션 표시 */}
            {!isSearchMode && (
              <>
                <div style={{ opacity: pageJumpLoading ? 0.5 : 1 }}>
                  <Pagination
                    current={currentPage}
                    total={filteredItems.length}
                    pageSize={pageSize}
                    onChange={async (page) => {
                      console.log(`🎯 페이지 변경 요청: ${currentPage} → ${page}`);
                      
                      // 페이지 점프가 필요한지 확인하고 데이터 로드
                      const success = await loadDataForPage(page);
                      if (success) {
                        setCurrentPage(page);
                        console.log(`✅ 페이지 ${page} 변경 완료`);
                      } else {
                        console.log(`❌ 페이지 ${page} 변경 실패`);
                      }
                    }}
                    showSizeChanger={false}
                    showTotal={(total, range) => {
                      // React Query는 정확한 총 개수를 제공하므로 '+' 표시 불필요
                      return `${range[0]}-${range[1]} / 총 ${total}개`;
                    }}
                    disabled={pageJumpLoading || isFetchingNextPage || isSearchMode}
                  />
                </div>
                
                {/* 페이지 점프 로딩 인디케이터 */}
                {(pageJumpLoading || isFetchingNextPage) && (
                  <div style={{ textAlign: 'center', marginTop: '8px' }}>
                    <Spin size="small" /> 
                    <span style={{ marginLeft: '8px', color: '#666', fontSize: '12px' }}>
                      {pageJumpLoading ? '페이지 데이터 로딩 중...' : '추가 데이터 로딩 중...'}
                    </span>
                  </div>
                )}
                
              </>
            )}
            
            {/* 검색 모드일 때 간단한 페이지네이션 */}
            {isSearchMode && filteredItems.length > pageSize && (
              <div style={{ textAlign: 'center' }}>
                <Pagination
                  current={currentPage}
                  total={filteredItems.length}
                  pageSize={pageSize}
                  onChange={setCurrentPage}
                  showSizeChanger={false}
                  showTotal={(total, range) => `${range[0]}-${range[1]} / 총 ${total}개`}
                  simple
                />
              </div>
            )}
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