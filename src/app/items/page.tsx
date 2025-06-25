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

// 실제 API에서 아이템 데이터를 가져오는 함수
const fetchItemsFromAPI = async (): Promise<MapleItem[]> => {
  const items: MapleItem[] = [];
  const itemIdRanges = [
    // 포션류
    { start: 2000000, count: 10 },
    { start: 2010000, count: 10 },
    { start: 2020000, count: 10 },
    // 장비류
    { start: 1000000, count: 10 },
    { start: 1010000, count: 10 },
    { start: 1020000, count: 10 },
    // 기타 아이템
    { start: 4000000, count: 10 },
    { start: 5000000, count: 10 },
  ];
  
  console.log('다양한 아이템 범위에서 데이터 로딩 중...');
  
  for (const range of itemIdRanges) {
    const promises: Promise<void>[] = [];
    
    for (let i = 0; i < range.count; i++) {
      const itemId = range.start + i;
      
      const promise = mapleAPI.getItem(itemId)
        .then((item) => {
          if (item && item.id && item.name) {
            items.push(item);
            console.log(`✓ 아이템 로드: ${item.name} (ID: ${item.id})`);
          }
        })
        .catch((error) => {
          // 404나 not found는 정상적인 경우이므로 무시
          if (error?.response?.status !== 404 && !error.message?.includes('not found')) {
            console.warn(`Failed to fetch item ${itemId}:`, error.message);
          }
        });
      
      promises.push(promise);
    }
    
    await Promise.allSettled(promises);
  }
  
  console.log(`총 ${items.length}개 아이템 로드 완료`);
  
  // ID순으로 정렬
  return items.sort((a, b) => a.id - b.id);
};

export default function ItemsPage() {
  const [items, setItems] = useState<MapleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MapleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const pageSize = 20;

  // 초기 데이터 로드
  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      try {
        console.log('API에서 아이템 데이터 로딩 시작...');
        const apiItems = await fetchItemsFromAPI(); // 다양한 범위의 아이템
        
        console.log(`${apiItems.length}개 아이템 로드 완료`);
        setItems(apiItems);
        setFilteredItems(apiItems);
      } catch (error) {
        console.error('아이템 로딩 실패:', error);
        message.error('아이템 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  // 검색 및 정렬 함수
  const filterAndSortItems = useCallback((query: string, sort: string) => {
    let filtered = items;

    // 검색 필터
    if (query) {
      filtered = items.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description?.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 정렬
    filtered = [...filtered].sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'category':
          return (a.category || '').localeCompare(b.category || '');
        default:
          return 0;
      }
    });

    setFilteredItems(filtered);
    setCurrentPage(1); // 검색/정렬 시 첫 페이지로 이동
  }, [items]);

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

        <ItemList items={paginatedItems} loading={loading} />

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