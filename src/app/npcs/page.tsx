'use client';

import { useState, useCallback, useEffect } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, App, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { NPCList } from '@/components/npcs/npc-list';
import { NPCDetailModal } from '@/components/npcs/npc-detail-modal';
import { useSearchNPCs, useNPCList, useMaps, useNPCsByMap } from '@/hooks/useMapleData';
import debounce from 'lodash.debounce';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function NPCsPage() {
  const { message } = App.useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [selectedNPCId, setSelectedNPCId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);
  const pageSize = 32;

  // NPC 검색 (React Query 훅 사용)
  const { 
    data: searchNPCs = [], 
    isLoading: isSearchLoading, 
    error: searchError,
    isError: isSearchError 
  } = useSearchNPCs(searchQuery, searchQuery.length >= 2);

  // 맵 목록
  const { 
    data: maps = [], 
    isLoading: isMapsLoading 
  } = useMaps({ startPosition: 0, count: 1000 });

  // 선택된 맵의 NPC 목록
  const { 
    data: mapNPCs = [], 
    isLoading: isMapNPCsLoading, 
    error: mapNPCsError,
    isError: isMapNPCsError 
  } = useNPCsByMap(selectedMapId);


  // 현재 표시할 NPC 목록 결정
  let npcs: any[] = [];
  let isLoading = false;
  let error: any = null;
  let isError = false;

  if (searchQuery.length >= 2) {
    // 검색 모드
    npcs = searchNPCs;
    isLoading = isSearchLoading;
    error = searchError;
    isError = isSearchError;
  } else if (selectedMapId) {
    // 맵 선택 모드
    npcs = mapNPCs;
    isLoading = isMapNPCsLoading;
    error = mapNPCsError;
    isError = isMapNPCsError;
  } else {
    // 기본 상태 (빈 목록)
    npcs = [];
    isLoading = false;
    error = null;
    isError = false;
  }

  // 중복 제거
  npcs = npcs.filter((npc, index, array) => 
    array.findIndex(n => n.id === npc.id) === index
  );

  // 디바운스된 검색 핸들러
  const debouncedSearchQuery = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
      setCurrentPage(1);
    }, 500),
    []
  );

  const handleSearch = useCallback((value: string) => {
    if (value.length === 0) {
      setSearchQuery('');
      setCurrentPage(1);
      return;
    }
    
    if (value.length === 1) {
      // 1글자는 경고 없이 그냥 무시
      return;
    }
    
    debouncedSearchQuery(value);
  }, [debouncedSearchQuery]);

  // 맵 선택 핸들러
  const handleMapSelect = useCallback((mapId: number | null) => {
    setSelectedMapId(mapId);
    setCurrentPage(1);
    // 맵 선택 시 검색어 초기화
    if (mapId) {
      setSearchQuery('');
    }
  }, []);

  // 정렬된 NPC 목록
  const sortedNPCs = [...npcs].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        const nameA = a.name || '';
        const nameB = b.name || '';
        return nameA.localeCompare(nameB);
      case 'id':
        return a.id - b.id;
      case 'map':
        const mapA = a.map?.name || a.location || '';
        const mapB = b.map?.name || b.location || '';
        return mapA.localeCompare(mapB);
      default:
        return 0;
    }
  });

  // 페이지네이션
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedNPCs = sortedNPCs.slice(startIndex, startIndex + pageSize);

  // NPC 클릭 핸들러
  const handleNPCClick = (npcId: number) => {
    setSelectedNPCId(npcId);
    setModalOpen(true);
  };

  // 모달 닫기
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedNPCId(null);
  };

  // 에러 처리
  useEffect(() => {
    if (isError && error) {
      message.error('NPC 데이터를 불러오는데 실패했습니다.');
    }
  }, [isError, error, message]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <Title level={2}>NPC 정보</Title>
          <Paragraph>
            메이플스토리의 다양한 NPC 정보를 검색하고 확인할 수 있습니다.
            <br />
            💡 검색어를 2글자 이상 입력하거나 맵을 선택하여 NPC를 찾을 수 있습니다.
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
                <Col xs={24} sm={16} md={12}>
                  <div style={{ marginBottom: '8px', fontWeight: 500 }}>NPC 검색</div>
                  <Search
                    placeholder="NPC 이름을 입력하세요 (2글자 이상)"
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    onChange={(e) => handleSearch(e.target.value)}
                    onSearch={handleSearch}
                  />
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <div style={{ marginBottom: '8px', fontWeight: 500 }}>맵 선택</div>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={selectedMapId}
                    onChange={handleMapSelect}
                    placeholder="맵을 선택하세요"
                    allowClear
                    loading={isMapsLoading}
                    showSearch
                    virtual={false}
                    filterOption={(input, option) =>
                      option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                    }
                    styles={{
                      popup: {
                        root: { maxHeight: 400, overflow: 'auto' }
                      }
                    }}
                  >
                    {maps.slice(0, 200).map(map => (
                      <Option key={map.id} value={map.id}>
                        {map.displayName}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <div style={{ marginBottom: '8px', fontWeight: 500 }}>정렬 기준</div>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={sortBy}
                    onChange={setSortBy}
                    placeholder="정렬 기준"
                  >
                    <Option value="name">이름순</Option>
                    <Option value="id">ID순</Option>
                    <Option value="map">맵순</Option>
                  </Select>
                </Col>
              </Row>
            </Col>
          </Row>

        </div>

        {/* 검색 결과 정보 */}
        {searchQuery && (
          <div style={{ 
            padding: '12px 16px', 
            background: '#f5f5f5', 
            borderRadius: '6px',
            marginBottom: '16px' 
          }}>
            <span>
              검색어: &quot;{searchQuery}&quot; · {sortedNPCs.length.toLocaleString()}개 NPC 발견
            </span>
          </div>
        )}

        {/* 맵 NPC 로딩 상태 */}
        {selectedMapId && isMapNPCsLoading && (
          <div style={{ 
            padding: '24px', 
            textAlign: 'center',
            background: '#f0f8ff',
            borderRadius: '8px',
            marginBottom: '24px',
            border: '1px solid #d6f4ff'
          }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px', color: '#1890ff' }}>
              <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                선택한 맵의 NPC를 불러오는 중...
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                해당 맵의 모든 NPC 정보를 가져오고 있습니다.
              </div>
            </div>
          </div>
        )}

        {/* 맵 NPC 결과 정보 */}
        {selectedMapId && !isMapNPCsLoading && mapNPCs.length > 0 && (
          <div style={{ 
            padding: '12px 16px', 
            background: '#f6ffed', 
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #b7eb8f'
          }}>
            <span style={{ color: '#52c41a', fontWeight: 500 }}>
              📍 선택한 맵에서 {mapNPCs.length.toLocaleString()}개의 NPC를 찾았습니다
            </span>
          </div>
        )}

        {/* 안내 메시지 */}
        {!searchQuery && !selectedMapId && npcs.length === 0 && !isLoading && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: '8px',
            border: '1px dashed #d9d9d9'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
            <Title level={4} style={{ color: '#666' }}>
              맵을 선택하거나 NPC를 검색해보세요
            </Title>
            <Paragraph style={{ color: '#999' }}>
              • 맵 선택: 특정 맵의 모든 NPC 보기<br/>
              • 검색: 2글자 이상 입력하여 NPC 찾기
            </Paragraph>
          </div>
        )}

        {/* 선택한 맵 에러 처리 */}
        {selectedMapId && !isMapNPCsLoading && isMapNPCsError && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: '#fff2f0',
            borderRadius: '8px',
            border: '1px dashed #ffccc7'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <Title level={4} style={{ color: '#cf1322' }}>
              맵 정보를 불러올 수 없습니다
            </Title>
            <Paragraph style={{ color: '#a8071a' }}>
              선택한 맵이 존재하지 않거나 접근할 수 없습니다.<br/>
              다른 맵을 선택해보세요.
            </Paragraph>
          </div>
        )}

        {/* 선택한 맵에 NPC가 없는 경우 */}
        {selectedMapId && !isMapNPCsLoading && !isMapNPCsError && mapNPCs.length === 0 && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: '#fff7e6',
            borderRadius: '8px',
            border: '1px dashed #ffd591'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏗️</div>
            <Title level={4} style={{ color: '#d46b08' }}>
              이 맵에는 NPC가 없습니다
            </Title>
            <Paragraph style={{ color: '#ad6800' }}>
              다른 맵을 선택해보세요.
            </Paragraph>
          </div>
        )}

        {/* NPC 목록 */}
        {(searchQuery || npcs.length > 0) && (
          <div style={{ marginBottom: '32px' }}>
            <NPCList 
              npcs={paginatedNPCs} 
              loading={isLoading} 
              onNPCClick={handleNPCClick} 
            />
          </div>
        )}

        {/* 페이지네이션 */}
        {!isLoading && sortedNPCs.length > pageSize && (
          <div className="flex justify-center mt-8">
            <Pagination
              current={currentPage}
              total={sortedNPCs.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total, range) => `${range[0]}-${range[1]} / 총 ${total}개`}
            />
          </div>
        )}

        {/* NPC 상세 모달 */}
        <NPCDetailModal
          npcId={selectedNPCId}
          open={modalOpen}
          onClose={handleModalClose}
        />
      </div>
    </MainLayout>
  );
}