'use client';

import { useState, useCallback, useEffect } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { ItemList } from '@/components/items/item-list';
import { MapleItem } from '@/types/maplestory';
import { mapleAPI } from '@/lib/api';
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
    { value: 'Mount', label: '라이딩' },
    { value: 'One-Handed Weapon', label: '한손 무기' },
    { value: 'Other', label: '그 외' },
    { value: 'Secondary Weapon', label: '보조 무기' },
    { value: 'Two-Handed Weapon', label: '두손 무기' },
    { value: 'Character', label: '성형/헤어' },
  ],
  armorSubCategories: [
    { value: 'Hat', label: '모자' },
    { value: 'Overall', label: '한벌옷' },
    { value: 'Top', label: '상의' },
    { value: 'Bottom', label: '하의' },
    { value: 'Shoes', label: '신발' },
    { value: 'Gloves', label: '장갑' },
    { value: 'Cape', label: '망토' },
    { value: 'Shield', label: '방패' },
  ],
};

export default function ItemsPage() {
  const [items, setItems] = useState<MapleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MapleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [overallCategory, setOverallCategory] = useState<string>('Equip');
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const pageSize = 32;

  // 카테고리별 데이터 로드
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        // 다양한 아이템 범위에서 데이터를 가져와서 클라이언트에서 필터링
        const fetchFromMultipleRanges = async () => {
          const ranges = [
            { start: 0, count: 100, type: 'Accessory' },
            { start: 100, count: 100, type: 'Accessory' },
            { start: 200, count: 100, type: 'Accessory' },
            { start: 300, count: 100, type: 'Accessory' },
            { start: 400, count: 100, type: 'Accessory' },
          ];
          
          const allItems: any[] = [];
          
          for (const range of ranges) {
            try {
              const params = {
                overallCategory,
                startPosition: range.start,
                count: range.count,
              };
              
              const items = await mapleAPI.getItemsByCategory(params);
              allItems.push(...items);
            } catch (error) {
              console.warn(`Range ${range.start}-${range.start + range.count} failed:`, error);
            }
          }
          
          return allItems;
        };
        
        const allItems = await fetchFromMultipleRanges();
        
        // 선택된 카테고리에 따라 클라이언트에서 필터링
        let filteredByCategory = allItems;
        if (category) {
          filteredByCategory = allItems.filter(item => 
            item.category && item.category.toLowerCase().includes(category.toLowerCase())
          );
        }
        if (subCategory) {
          filteredByCategory = filteredByCategory.filter(item => 
            item.subcategory && item.subcategory.toLowerCase().includes(subCategory.toLowerCase())
          );
        }
        
        console.log(`총 ${allItems.length}개 아이템 중 ${filteredByCategory.length}개 필터링 완료`);
        setItems(filteredByCategory);
        setFilteredItems(filteredByCategory);
      } catch (error) {
        console.error('아이템 로딩 실패:', error);
        message.error('아이템 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [overallCategory, category, subCategory]);

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

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    setSortBy(value);
    filterAndSortItems(searchQuery, value);
  };

  // 페이지네이션
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

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
                        setSubCategory('');
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
              </Row>
            </Col>
            
            <Col span={24}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={16} md={12}>
                  <Search
                    placeholder="아이템 이름을 검색하세요"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onSearch={handleSearch}
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
                    <Option value="name">이름순</Option>
                    <Option value="category">카테고리순</Option>
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