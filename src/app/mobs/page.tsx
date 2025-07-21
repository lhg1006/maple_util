'use client';

import { useState, useCallback, useEffect } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, App, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { MobList } from '@/components/mobs/mob-list';
import { MobDetailModal } from '@/components/mobs/mob-detail-modal';
import { MapleMob } from '@/types/maplestory';
import { mapleAPI } from '@/lib/api';
import { useTheme } from '@/components/providers/theme-provider';
import debounce from 'lodash.debounce';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function MobsPage() {
  const { message } = App.useApp();
  const { theme: currentTheme } = useTheme();
  const [mobs, setMobs] = useState<MapleMob[]>([]);
  const [filteredMobs, setFilteredMobs] = useState<MapleMob[]>([]);
  const [displayMobs, setDisplayMobs] = useState<MapleMob[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [hasMoreMobs, setHasMoreMobs] = useState(true);
  const [totalLoadedMobs, setTotalLoadedMobs] = useState(0);
  const [pageJumpLoading, setPageJumpLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('level');
  const [levelRange, setLevelRange] = useState<string>('all');
  const [monsterType, setMonsterType] = useState<string>('all');
  const [specialType, setSpecialType] = useState<string>('all');
  const [selectedMobId, setSelectedMobId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pageSize = 32;
  const batchSize = 500;

  // 실제 데이터 기반 필터
  const LEVEL_RANGES = [
    { value: 'all', label: '전체' },
    { value: '1-50', label: '초급 (1-50레벨)' },
    { value: '51-100', label: '중급 (51-100레벨)' },
    { value: '101-200', label: '고급 (101-200레벨)' },
    { value: '201-300', label: '최고급 (201-300레벨)' },
  ];

  const MONSTER_TYPES = [
    { value: 'all', label: '전체' },
    { value: 'normal', label: '일반 몬스터' },
    { value: 'boss', label: '보스 몬스터' },
  ];

  const SPECIAL_TYPES = [
    { value: 'all', label: '전체' },
    { value: 'elite', label: '엘리트 몬스터' },
    { value: 'infernal', label: '인퍼널 몬스터' },
    { value: 'deadly', label: '데들리 몬스터' },
    { value: 'dangerous', label: '위험한 몬스터' },
    { value: 'giant', label: '거대 몬스터' },
    { value: 'enhanced', label: '강화 몬스터' },
  ];

  // 초기 데이터 로드
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setDataLoading(true);
        console.log('🚀 API에서 몬스터 데이터 로드 시작...');
        
        const mobsData = await mapleAPI.getMobsByCategory({ 
          startPosition: 0, 
          count: batchSize 
        });
        
        console.log(`✅ API 몬스터 데이터 로드 완료: ${mobsData.length}개`);
        message.success(`${mobsData.length.toLocaleString()}개 몬스터 데이터를 불러왔습니다.`);
        
        setMobs(mobsData);
        setFilteredMobs(mobsData);
        setTotalLoadedMobs(mobsData.length);
        setHasMoreMobs(mobsData.length === batchSize);
      } catch (error) {
        console.error('❌ 몬스터 데이터 로드 실패:', error);
        message.error('몬스터 데이터를 불러오는데 실패했습니다.');
      } finally {
        setDataLoading(false);
      }
    };
    
    loadInitialData();
  }, [message]);


  // 페이지 점프 시 필요한 데이터 로드
  const loadDataForPage = async (targetPage: number) => {
    const requiredMobs = targetPage * pageSize;
    const currentMobs = mobs.length;
    
    if (requiredMobs <= currentMobs) {
      // 이미 충분한 데이터가 있으면 바로 페이지 변경
      return true;
    }
    
    try {
      setPageJumpLoading(true);
      console.log(`🚀 페이지 ${targetPage} 점프를 위한 데이터 로드 시작...`);
      console.log(`필요한 몬스터: ${requiredMobs}개, 현재 몬스터: ${currentMobs}개`);
      
      const allMobs = [...mobs];
      let currentPosition = totalLoadedMobs;
      
      // 필요한 만큼 데이터를 배치로 로드
      while (allMobs.length < requiredMobs && hasMoreMobs) {
        const newMobs = await mapleAPI.getMobsByCategory({
          startPosition: currentPosition,
          count: batchSize
        });
        
        console.log(`📦 배치 로드 완료: ${newMobs.length}개 (총 ${allMobs.length + newMobs.length}개)`);
        
        if (newMobs.length === 0) {
          setHasMoreMobs(false);
          break;
        }
        
        allMobs.push(...newMobs);
        currentPosition += newMobs.length;
        
        // 충분한 데이터가 로드되면 중단
        if (allMobs.length >= requiredMobs) {
          break;
        }
      }
      
      setMobs(allMobs);
      setTotalLoadedMobs(currentPosition);
      setHasMoreMobs(currentPosition > 0 && allMobs.length === currentPosition);
      
      console.log(`✅ 페이지 ${targetPage} 데이터 로드 완료: ${allMobs.length}개`);
      return true;
      
    } catch (error) {
      console.error('❌ 페이지 점프 데이터 로드 실패:', error);
      message.error('페이지 데이터를 불러오는데 실패했습니다.');
      return false;
    } finally {
      setPageJumpLoading(false);
    }
  };

  // 필터링 적용
  useEffect(() => {
    if (mobs.length === 0 || pageJumpLoading) return;

    setLoading(true);
    try {
      console.log(`🔍 필터링 중... 레벨: ${levelRange}, 타입: ${monsterType}, 특수: ${specialType}`);
      
      // 전체 데이터에서 필터링
      const filteredData = mobs.filter((monster: MapleMob) => {
        const level = monster.level || 0;
        const name = monster.name || '';
        
        // 레벨 범위 필터
        let levelMatch = true;
        switch (levelRange) {
          case '1-50':
            levelMatch = level >= 1 && level <= 50;
            break;
          case '51-100':
            levelMatch = level >= 51 && level <= 100;
            break;
          case '101-200':
            levelMatch = level >= 101 && level <= 200;
            break;
          case '201-300':
            levelMatch = level >= 201 && level <= 300;
            break;
          case 'all':
          default:
            levelMatch = true;
        }
        
        // 몬스터 타입 필터 (API에서 boss 정보가 없으므로 이름으로 판단)
        let typeMatch = true;
        switch (monsterType) {
          case 'normal':
            typeMatch = !name.includes('보스') && !name.includes('킹') && !name.includes('퀸');
            break;
          case 'boss':
            typeMatch = name.includes('보스') || name.includes('킹') || name.includes('퀸');
            break;
          case 'all':
          default:
            typeMatch = true;
        }
        
        // 특수 몬스터 필터
        let specialMatch = true;
        switch (specialType) {
          case 'elite':
            specialMatch = name.includes('엘리트');
            break;
          case 'infernal':
            specialMatch = name.includes('인퍼널');
            break;
          case 'deadly':
            specialMatch = name.includes('데들리');
            break;
          case 'dangerous':
            specialMatch = name.includes('위험한');
            break;
          case 'giant':
            specialMatch = name.includes('거대') || name.includes('큰 ');
            break;
          case 'enhanced':
            specialMatch = name.includes('강화') || name.includes('변종');
            break;
          case 'all':
          default:
            specialMatch = true;
        }
        
        return levelMatch && typeMatch && specialMatch;
      });

      console.log(`📊 필터링 결과: ${filteredData.length}개 몬스터 발견`);
      setFilteredMobs(filteredData);
    } catch (error) {
      console.error('❌ 필터링 실패:', error);
      message.error('데이터 필터링에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [mobs, levelRange, monsterType, specialType, message, pageJumpLoading]);

  // 검색 및 정렬 적용
  useEffect(() => {
    if (pageJumpLoading) return;
    
    let filtered = [...filteredMobs];

    // 검색 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(mob => 
        mob.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'ko', { numeric: true });
        case 'level':
          return (a.level || 0) - (b.level || 0);
        default:
          return 0;
      }
    });

    setDisplayMobs(filtered);
    // 검색어나 정렬 기준이 변경될 때만 페이지를 1로 초기화
    // 필터링된 데이터가 변경되는 것만으로는 페이지를 초기화하지 않음
  }, [filteredMobs, searchQuery, sortBy, pageJumpLoading]);

  // 검색어나 정렬 기준 변경 시에만 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // 필터 변경시 초기화
  useEffect(() => {
    setSearchQuery('');
    setCurrentPage(1);
  }, [levelRange, monsterType, specialType]);

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

  // 몬스터 클릭 핸들러
  const handleMobClick = (mobId: number) => {
    setSelectedMobId(mobId);
    setModalOpen(true);
  };

  // 모달 닫기
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedMobId(null);
  };

  // 로딩 화면
  if (dataLoading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" spinning={true}>
            <div style={{ minHeight: '200px' }} />
          </Spin>
          <div style={{ marginTop: '20px', color: '#666', fontSize: '16px' }}>
            API에서 몬스터 데이터 로딩 중...
          </div>
          <div style={{ marginTop: '8px', color: '#999', fontSize: '14px' }}>
            API 서버에서 몬스터 정보를 가져오는 중입니다...
          </div>
        </div>
      </MainLayout>
    );
  }

  // 페이지네이션
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMobs = displayMobs.slice(startIndex, startIndex + pageSize);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <Title level={2}>몬스터 정보</Title>
          <Paragraph>
            메이플스토리의 다양한 몬스터 정보를 검색하고 확인할 수 있습니다.
            <br />
            📊 총 {totalLoadedMobs.toLocaleString()}개 몬스터 로드됨 {hasMoreMobs && '(더 있음)'}
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
            {/* 필터 그룹 */}
            <Col span={24}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8} md={6}>
                  <div style={{ marginBottom: '8px', fontWeight: 500 }}>레벨 범위</div>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={levelRange}
                    onChange={setLevelRange}
                    placeholder="레벨 선택"
                  >
                    {LEVEL_RANGES.map(range => (
                      <Option key={range.value} value={range.value}>{range.label}</Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <div style={{ marginBottom: '8px', fontWeight: 500 }}>몬스터 타입</div>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={monsterType}
                    onChange={setMonsterType}
                    placeholder="타입 선택"
                  >
                    {MONSTER_TYPES.map(type => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} sm={8} md={6}>
                  <div style={{ marginBottom: '8px', fontWeight: 500 }}>특수 종류</div>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={specialType}
                    onChange={setSpecialType}
                    placeholder="특수 타입 선택"
                  >
                    {SPECIAL_TYPES.map(type => (
                      <Option key={type.value} value={type.value}>{type.label}</Option>
                    ))}
                  </Select>
                </Col>
              </Row>
            </Col>
            
            {/* 검색 및 정렬 */}
            <Col span={24}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={16} md={12}>
                  <Search
                    placeholder="몬스터 이름을 검색하세요"
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
                    <Option value="level">레벨순</Option>
                    <Option value="name">이름순</Option>
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
            {LEVEL_RANGES.find(range => range.value === levelRange)?.label}
            {monsterType !== 'all' && ` · ${MONSTER_TYPES.find(type => type.value === monsterType)?.label}`}
            {specialType !== 'all' && ` · ${SPECIAL_TYPES.find(type => type.value === specialType)?.label}`}
            : {displayMobs.length.toLocaleString()}개
            {searchQuery && ` (검색어: "${searchQuery}")`}
          </span>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <MobList mobs={paginatedMobs} loading={loading} onMobClick={handleMobClick} />
        </div>

        {!loading && displayMobs.length > 0 && (
          <div>
            <div style={{ opacity: pageJumpLoading ? 0.5 : 1 }}>
              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  total={displayMobs.length}
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
                    const totalText = hasMoreMobs ? `${total}+` : `${total}`;
                    return `${range[0]}-${range[1]} / 총 ${totalText}개`;
                  }}
                  disabled={pageJumpLoading}
                />
              </div>
              
              {/* 페이지 점프 로딩 인디케이터 */}
              {pageJumpLoading && (
                <div style={{ textAlign: 'center', marginTop: '8px' }}>
                  <Spin size="small" /> 
                  <span style={{ marginLeft: '8px', color: '#666', fontSize: '12px' }}>데이터 로딩 중...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 몬스터 상세 모달 */}
        <MobDetailModal
          mobId={selectedMobId}
          open={modalOpen}
          onClose={handleModalClose}
        />
      </div>
    </MainLayout>
  );
}