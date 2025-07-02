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

    // 2차 카테고리 필터 (장비만)
    if (category && overallCategory === 'Equip') {
      filtered = filtered.filter(item => item.category === category);
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
  }, [items, searchQuery, sortBy, category, overallCategory]);

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
                
                {/* 장비 2차 분류 */}
                {overallCategory === 'Equip' && (
                  <Col xs={24} sm={12} md={8}>
                    <Select
                      style={{ width: '100%' }}
                      size="large"
                      value={category}
                      onChange={setCategory}
                      placeholder="2차 분류 선택"
                    >
                      {ITEM_CATEGORIES.equipCategories.map(cat => (
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
            {overallCategory === 'Equip' && category ? `${overallCategory} > ${category}` : overallCategory}: {filteredItems.length.toLocaleString()}개
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