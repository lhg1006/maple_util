'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, App, Spin, Badge } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { NPCList } from '@/components/npcs/npc-list';
import { NPCDetailModal } from '@/components/npcs/npc-detail-modal';
import { useSearchNPCs, useAllMaps, useNPCsByMap } from '@/hooks/useMapleData';
import { ContinentStatsCards } from '@/components/npcs/continent-stats-cards';
import debounce from 'lodash.debounce';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

// 대륙별 색상 함수 (확장)
const getContinentColor = (continent: string): string => {
  switch (continent) {
    case '메이플 로드': return '#52c41a';
    case '빅토리아 아일랜드': return '#1890ff';
    case '엘나스': return '#40a9ff';
    case '오르비스': return '#722ed1';
    case '루디브리엄': return '#722ed1';
    case '아쿠아로드': return '#13c2c2';
    case '리프레': return '#52c41a';
    case '무릉 지역': return '#fa8c16';
    case '니할사막': return '#d4b106';
    case '마가티아': return '#fa541c';
    case '에델슈타인': return '#f5222d';
    case '아르카나': return '#722ed1';
    case '모라스': return '#531dab';
    case '에스페라': return '#9254de';
    case '레헬른': return '#b37feb';
    case '츄츄 아일랜드': return '#d3adf7';
    case '얌얌 아일랜드': return '#efdbff';
    case '세르니움': return '#f759ab';
    case '호텔 아르크스': return '#ff85c0';
    case '오디움': return '#ffadd2';
    case '도원경': return '#ffd6e7';
    case '카르시온': return '#fff0f6';
    case '커닝시티': return '#eb2f96';
    case '에레브': return '#1890ff';
    case '지구방위본부': return '#13c2c2';
    case '크리티아스': return '#722ed1';
    case '요정계': return '#13c2c2';
    case '버섯 왕국': return '#fa8c16';
    case '테마파크 & 이벤트': return '#f759ab';
    case '던전 & 미궁': return '#f5222d';
    case '스토리 & 퀘스트': return '#722ed1';
    case '도시 & 학교': return '#1890ff';
    case '해상 지역': return '#1890ff';
    case '히든 & 특수': return '#8c8c8c';
    case '기타 지역': return '#666666';
    default: return '#666666';
  }
};

export default function NPCsPage() {
  const { message } = App.useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [selectedNPCId, setSelectedNPCId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);
  const [selectedContinent, setSelectedContinent] = useState<string>('all');
  const pageSize = 32;

  // NPC 검색 (React Query 훅 사용)
  const { 
    data: searchNPCs = [], 
    isLoading: isSearchLoading, 
    error: searchError,
    isError: isSearchError 
  } = useSearchNPCs(searchQuery, searchQuery.length >= 2);

  // 맵 목록 (전체 데이터)
  const { 
    data: maps = [], 
    isLoading: isMapsLoading 
  } = useAllMaps();

  // 대륙별 필터링된 맵 목록
  const filteredMaps = useMemo(() => {
    if (selectedContinent === 'all') {
      return maps;
    }
    return maps.filter((map: any) => map.continent === selectedContinent);
  }, [maps, selectedContinent]);

  // 대륙별 통계 (정렬된)
  const continentStats = useMemo(() => {
    const stats: Record<string, number> = {};
    maps.forEach((map: any) => {
      const continent = map.continent || '기타';
      stats[continent] = (stats[continent] || 0) + 1;
    });
    
    // 대륙을 중요도 순으로 정렬 (업데이트)
    const continentOrder = [
      '메이플 로드',
      '빅토리아 아일랜드',
      '엘나스',
      '오르비스',
      '루디브리엄',
      '아쿠아로드',
      '리프레',
      '무릉 지역',
      '니할사막',
      '마가티아',
      '에델슈타인',
      '츄츄 아일랜드',
      '얌얌 아일랜드',
      '레헬른',
      '아르카나',
      '모라스',
      '에스페라',
      '세르니움',
      '호텔 아르크스',
      '오디움',
      '도원경',
      '카르시온',
      '커닝시티',
      '에레브',
      '지구방위본부',
      '크리티아스',
      '요정계',
      '버섯 왕국',
      '테마파크 & 이벤트',
      '던전 & 미궁',
      '스토리 & 퀘스트',
      '도시 & 학교',
      '해상 지역',
      '히든 & 특수',
      '기타 지역'
    ];
    
    const sortedStats: Record<string, number> = {};
    continentOrder.forEach(continent => {
      if (stats[continent]) {
        sortedStats[continent] = stats[continent];
      }
    });
    
    // 정렬에 없는 대륙들 추가
    Object.entries(stats).forEach(([continent, count]) => {
      if (!sortedStats[continent]) {
        sortedStats[continent] = count;
      }
    });
    
    return sortedStats;
  }, [maps]);

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

  // 대륙 선택 핸들러
  const handleContinentSelect = useCallback((continent: string) => {
    setSelectedContinent(continent);
    setSelectedMapId(null); // 대륙 변경 시 맵 선택 초기화
    setCurrentPage(1);
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
            💡 대륙을 선택한 후 맵을 선택하거나, 검색어를 2글자 이상 입력하여 NPC를 찾을 수 있습니다.
            {isMapsLoading && (
              <>
                <br />
                📁 <strong>맵 데이터를 로딩 중입니다...</strong> 정적 파일에서 13,973개 맵 데이터를 불러오고 있습니다.
              </>
            )}
          </Paragraph>
        </div>

        {/* 대륙별 통계 카드 */}
        {!searchQuery && !selectedMapId && (
          <ContinentStatsCards 
            onContinentSelect={handleContinentSelect}
            selectedContinent={selectedContinent !== 'all' ? selectedContinent : undefined}
          />
        )}

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
                <Col xs={24} sm={12} md={8}>
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
                <Col xs={24} sm={12} md={4}>
                  <div style={{ marginBottom: '8px', fontWeight: 500 }}>대륙 선택</div>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={selectedContinent}
                    onChange={handleContinentSelect}
                    placeholder="대륙을 선택하세요"
                  >
                    <Option value="all">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span>전체 대륙</span>
                        <Badge count={Object.values(continentStats).reduce((a, b) => a + b, 0)} size="small" style={{ backgroundColor: '#52c41a' }} />
                      </div>
                    </Option>
                    {Object.entries(continentStats).map(([continent, count]) => (
                      <Option key={continent} value={continent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span style={{ color: getContinentColor(continent) }}>{continent}</span>
                          <Badge count={count} size="small" style={{ backgroundColor: getContinentColor(continent) }} />
                        </div>
                      </Option>
                    ))}
                  </Select>
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
                    {filteredMaps.slice(0, 1000).map((map: any) => (
                      <Option key={map.id} value={map.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <EnvironmentOutlined style={{ color: getContinentColor(map.continent) }} />
                          {map.displayName}
                        </div>
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

        {/* 선택된 대륙 정보 */}
        {selectedContinent !== 'all' && (
          <div style={{ 
            padding: '16px', 
            background: '#f0f8ff', 
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #b7eb8f'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EnvironmentOutlined style={{ color: getContinentColor(selectedContinent), fontSize: '18px' }} />
              <span style={{ fontWeight: 'bold', color: getContinentColor(selectedContinent) }}>
                선택된 대륙: {selectedContinent}
              </span>
              <span>· {filteredMaps.length}개 맵 존재</span>
              {selectedMapId && <span>· 선택된 맵에서 {npcs.length}개 NPC 발견</span>}
            </div>
          </div>
        )}

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