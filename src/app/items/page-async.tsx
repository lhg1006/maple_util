'use client';

import { useState, useCallback, useEffect } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, App, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { ItemList } from '@/components/items/item-list';
import { MapleItem } from '@/types/maplestory';
import { loadCompleteItems } from '@/lib/data-loader';
import debounce from 'lodash.debounce';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// 카테고리 옵션은 동일...

export default function ItemsPageAsync() {
  const { message } = App.useApp();
  const [items, setItems] = useState<MapleItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MapleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [completeItems, setCompleteItems] = useState<any>({});
  // ... 기타 state들

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setDataLoading(true);
      try {
        const data = await loadCompleteItems();
        setCompleteItems(data);
        console.log(`로드된 아이템 수: ${Object.keys(data).length}`);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        message.error('데이터를 불러오는데 실패했습니다.');
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [message]);

  // 카테고리별 데이터 필터링
  useEffect(() => {
    if (dataLoading || Object.keys(completeItems).length === 0) return;

    const loadItems = async () => {
      setLoading(true);
      try {
        let filteredItems = Object.values(completeItems).map(item => ({
          id: item.id,
          name: item.name,
          category: item.category || '',
          subcategory: item.subcategory || '',
          description: item.description || '',
          icon: `https://maplestory.io/api/KMS/389/item/${item.id}/icon`,
          cash: item.isCash || false,
          price: item.sellPrice || 0,
        })) as MapleItem[];

        // 필터링 로직...
        
        setItems(filteredItems);
        setFilteredItems(filteredItems);
      } catch (error) {
        console.error('아이템 처리 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [completeItems, dataLoading]);

  if (dataLoading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" tip="데이터를 불러오는 중입니다..." />
        </div>
      </MainLayout>
    );
  }

  // 나머지 렌더링 로직...
}