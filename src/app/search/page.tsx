'use client';

import { useState, useCallback, useEffect } from 'react';
import { Typography, Input, Tabs, Empty, Spin, Tag, Badge } from 'antd';
import { SearchOutlined, UserOutlined, BugOutlined, ShoppingOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { ItemList } from '@/components/items/item-list';
import { NPCList } from '@/components/npcs/npc-list';
import { MobList } from '@/components/mobs/mob-list';
import { useSearchItems, useSearchNPCs, useSearchMobs } from '@/hooks/useMapleData';
import { ItemDetailModal } from '@/components/items/item-detail-modal';
import { NPCDetailModal } from '@/components/npcs/npc-detail-modal';
import { MobDetailModal } from '@/components/mobs/mob-detail-modal';
import debounce from 'lodash.debounce';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

interface SearchResultStats {
  items: number;
  npcs: number;
  mobs: number;
  total: number;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // Modal states
  const [selectedItem, setSelectedItemId] = useState<any | null>(null);
  const [selectedNPCId, setSelectedNPCId] = useState<number | null>(null);
  const [selectedMobId, setSelectedMobId] = useState<number | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [npcModalOpen, setNPCModalOpen] = useState(false);
  const [mobModalOpen, setMobModalOpen] = useState(false);

  // Search hooks
  const { data: items = [], isLoading: itemsLoading } = useSearchItems(debouncedQuery, debouncedQuery.length >= 2);
  const { data: npcs = [], isLoading: npcsLoading } = useSearchNPCs(debouncedQuery, debouncedQuery.length >= 2);
  const { data: mobs = [], isLoading: mobsLoading } = useSearchMobs(debouncedQuery, debouncedQuery.length >= 2);

  const isLoading = itemsLoading || npcsLoading || mobsLoading;

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedQuery(query);
    }, 500),
    []
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      debouncedSearch(value);
    } else {
      setDebouncedQuery('');
    }
  };

  // Calculate search stats
  const searchStats: SearchResultStats = {
    items: items.length,
    npcs: npcs.length,
    mobs: mobs.length,
    total: items.length + npcs.length + mobs.length
  };

  // Save search history
  useEffect(() => {
    if (debouncedQuery && searchStats.total > 0 && typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
      const newHistory = [debouncedQuery, ...history.filter((h: string) => h !== debouncedQuery)].slice(0, 10);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
  }, [debouncedQuery, searchStats.total]);

  // Handle item click
  const handleItemClick = (item: any) => {
    setSelectedItemId(item);
    setItemModalOpen(true);
  };

  // Handle NPC click
  const handleNPCClick = (npcId: number) => {
    setSelectedNPCId(npcId);
    setNPCModalOpen(true);
  };

  // Handle Mob click
  const handleMobClick = (mob: any) => {
    setSelectedMobId(mob.id);
    setMobModalOpen(true);
  };

  // Tab items
  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          전체 <Badge count={searchStats.total} showZero />
        </span>
      ),
      children: (
        <div className="space-y-8">
          {searchStats.items > 0 && (
            <div>
              <Title level={4}>
                <ShoppingOutlined /> 아이템 ({searchStats.items}개)
              </Title>
              <ItemList 
                items={items.slice(0, 8)} 
                loading={itemsLoading}
                onItemClick={handleItemClick}
              />
              {searchStats.items > 8 && (
                <div className="text-center mt-4">
                  <a onClick={() => setActiveTab('items')}>
                    더 보기 ({searchStats.items - 8}개 더)
                  </a>
                </div>
              )}
            </div>
          )}
          
          {searchStats.npcs > 0 && (
            <div>
              <Title level={4}>
                <UserOutlined /> NPC ({searchStats.npcs}개)
              </Title>
              <NPCList 
                npcs={npcs.slice(0, 8)} 
                loading={npcsLoading}
                onNPCClick={handleNPCClick}
              />
              {searchStats.npcs > 8 && (
                <div className="text-center mt-4">
                  <a onClick={() => setActiveTab('npcs')}>
                    더 보기 ({searchStats.npcs - 8}개 더)
                  </a>
                </div>
              )}
            </div>
          )}
          
          {searchStats.mobs > 0 && (
            <div>
              <Title level={4}>
                <BugOutlined /> 몬스터 ({searchStats.mobs}개)
              </Title>
              <MobList 
                mobs={mobs.slice(0, 8)} 
                loading={mobsLoading}
                onMobClick={handleMobClick}
              />
              {searchStats.mobs > 8 && (
                <div className="text-center mt-4">
                  <a onClick={() => setActiveTab('mobs')}>
                    더 보기 ({searchStats.mobs - 8}개 더)
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'items',
      label: (
        <span>
          <ShoppingOutlined /> 아이템 <Badge count={searchStats.items} />
        </span>
      ),
      children: <ItemList items={items} loading={itemsLoading} onItemClick={handleItemClick} />
    },
    {
      key: 'npcs',
      label: (
        <span>
          <UserOutlined /> NPC <Badge count={searchStats.npcs} />
        </span>
      ),
      children: <NPCList npcs={npcs} loading={npcsLoading} onNPCClick={handleNPCClick} />
    },
    {
      key: 'mobs',
      label: (
        <span>
          <BugOutlined /> 몬스터 <Badge count={searchStats.mobs} />
        </span>
      ),
      children: <MobList mobs={mobs} loading={mobsLoading} onMobClick={handleMobClick} />
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <Title level={2}>통합 검색</Title>
          <Paragraph>
            아이템, NPC, 몬스터를 한 번에 검색할 수 있습니다.
          </Paragraph>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto">
          <Search
            placeholder="검색어를 입력하세요 (2글자 이상)"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
            style={{ width: '100%' }}
          />
        </div>

        {/* Search History */}
        {!debouncedQuery && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-2">
              <Text type="secondary">최근 검색어</Text>
            </div>
            <div className="flex flex-wrap gap-2">
              {(typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('searchHistory') || '[]') : []).map((query: string, index: number) => (
                <Tag 
                  key={index}
                  className="cursor-pointer"
                  onClick={() => {
                    setSearchQuery(query);
                    setDebouncedQuery(query);
                  }}
                >
                  {query}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {debouncedQuery && (
          <>
            {/* Results Summary */}
            <div className="text-center py-4">
              <Title level={4} type="secondary">
                &quot;{debouncedQuery}&quot; 검색 결과
              </Title>
              {!isLoading && (
                <Paragraph type="secondary">
                  총 {searchStats.total}개 결과 
                  (아이템 {searchStats.items}개, NPC {searchStats.npcs}개, 몬스터 {searchStats.mobs}개)
                </Paragraph>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <Spin size="large" />
                <div style={{ marginTop: '16px', fontSize: '16px', color: '#666' }}>
                  검색 중...
                </div>
              </div>
            )}

            {/* No Results */}
            {!isLoading && searchStats.total === 0 && (
              <Empty
                description={
                  <div>
                    <Title level={4} type="secondary">
                      검색 결과가 없습니다
                    </Title>
                    <Paragraph type="secondary">
                      다른 검색어를 입력해보세요.
                    </Paragraph>
                  </div>
                }
              />
            )}

            {/* Results Tabs */}
            {!isLoading && searchStats.total > 0 && (
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                size="large"
              />
            )}
          </>
        )}

        {/* Modals */}
        <ItemDetailModal
          item={selectedItem}
          open={itemModalOpen}
          onClose={() => {
            setItemModalOpen(false);
            setSelectedItemId(null);
          }}
        />
        
        <NPCDetailModal
          npcId={selectedNPCId}
          open={npcModalOpen}
          onClose={() => {
            setNPCModalOpen(false);
            setSelectedNPCId(null);
          }}
        />
        
        <MobDetailModal
          mobId={selectedMobId}
          open={mobModalOpen}
          onClose={() => {
            setMobModalOpen(false);
            setSelectedMobId(null);
          }}
        />
      </div>
    </MainLayout>
  );
}