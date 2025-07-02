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

// 카테고리 옵션 (기존과 동일)
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
  // ... 나머지 카테고리들
};

export default function ItemsPageCDN() {
  const { message } = App.useApp();
  const [items, setItems] = useState<MapleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MapleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('category');
  const [overallCategory, setOverallCategory] = useState<string>('Equip');
  const [category, setCategory] = useState<string>('Accessory');
  const [subCategory, setSubCategory] = useState<string>('Face Accessory');
  const [subSubCategory, setSubSubCategory] = useState<string>('');
  const [subSubSubCategory, setSubSubSubCategory] = useState<string>('');
  const pageSize = 24;

  // CDN에서 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        const itemsData = await loadItems();
        console.log('CDN 데이터 로드 완료');
        
        // 로드된 데이터를 바로 필터링에 사용
        loadCategoryItems(itemsData);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        message.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, []);

  // 카테고리별 데이터 로드
  const loadCategoryItems = useCallback((itemsData: any) => {
    setLoading(true);
    setCurrentPage(1);
    
    try {
      let filteredItems = Object.values(itemsData).map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category || '',
        subcategory: item.subcategory || '',
        description: item.description || '',
        icon: `https://maplestory.io/api/KMS/389/item/${item.id}/icon`,
        cash: item.isCash || false,
        price: item.sellPrice || 0,
      })) as MapleItem[];

      // 대분류 필터링
      filteredItems = filteredItems.filter(item => {
        const itemData = itemsData[item.id];
        if (itemData && itemData.typeInfo?.overallCategory) {
          return itemData.typeInfo.overallCategory === overallCategory;
        }
        return false;
      });

      console.log(`${overallCategory} 카테고리: ${filteredItems.length}개 아이템`);
      
      setItems(filteredItems);
      setFilteredItems(filteredItems);
    } catch (error) {
      console.error('아이템 필터링 실패:', error);
      message.error('아이템을 처리하는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [overallCategory, message]);

  // 카테고리 변경시 재필터링
  useEffect(() => {
    if (!dataLoading) {
      loadItems().then(itemsData => {
        loadCategoryItems(itemsData);
      });
    }
  }, [overallCategory, dataLoading, loadCategoryItems]);

  // 검색 및 정렬
  useEffect(() => {
    let filtered = [...items];

    // 검색 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 중분류 필터
    if (category && overallCategory === 'Equip') {
      filtered = filtered.filter(item => item.category === category);
    }

    // 소분류 필터
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
  }, [items, searchQuery, sortBy, category, subCategory]);

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
          <Spin size="large" tip="데이터를 불러오는 중입니다..." />
          <div style={{ marginTop: '20px', color: '#666' }}>
            CDN에서 데이터를 다운로드하고 있습니다...
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
          </Paragraph>
        </div>

        {/* 필터 UI (기존과 동일) */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '24px',
          marginTop: '32px',
          marginBottom: '32px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          {/* 필터 컴포넌트들... */}
        </div>

        <div style={{ marginBottom: '4px' }}>
          <ItemList items={paginatedItems} loading={loading} />
        </div>

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