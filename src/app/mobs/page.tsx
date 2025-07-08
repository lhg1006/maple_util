'use client';

import { useState, useCallback, useEffect } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, App, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { MobList } from '@/components/mobs/mob-list';
import { MobDetailModal } from '@/components/mobs/mob-detail-modal';
import { MapleMob } from '@/types/maplestory';
import { useDataStore } from '@/stores/useDataStore';
import debounce from 'lodash.debounce';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function MobsPage() {
  const { message } = App.useApp();
  const { monsters, monstersLoaded } = useDataStore();
  const [mobs, setMobs] = useState<MapleMob[]>([]);
  const [filteredMobs, setFilteredMobs] = useState<MapleMob[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('level');
  const [levelRange, setLevelRange] = useState<string>('all');
  const [monsterType, setMonsterType] = useState<string>('all');
  const [specialType, setSpecialType] = useState<string>('all');
  const [selectedMobId, setSelectedMobId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pageSize = 32;

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

  // 데이터 로딩 상태 확인
  useEffect(() => {
    if (monstersLoaded && Object.keys(monsters).length > 0) {
      console.log('✅ 전역 스토어에서 몬스터 데이터 사용:', Object.keys(monsters).length);
      message.success(`${Object.keys(monsters).length.toLocaleString()}개 몬스터 데이터를 사용 중입니다.`);
    }
  }, [monstersLoaded, monsters, message]);

  // 다중 필터링
  useEffect(() => {
    if (!monstersLoaded || Object.keys(monsters).length === 0) return;

    setLoading(true);
    try {
      console.log(`🔍 필터링 중... 레벨: ${levelRange}, 타입: ${monsterType}, 특수: ${specialType}`);
      
      // 전체 데이터에서 필터링
      const filteredData = Object.values(monsters).filter((monster: any) => {
        const level = monster.level || 0;
        const name = monster.name || '';
        const isBoss = monster.boss || false;
        
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
        
        // 몬스터 타입 필터
        let typeMatch = true;
        switch (monsterType) {
          case 'normal':
            typeMatch = !isBoss;
            break;
          case 'boss':
            typeMatch = isBoss;
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

      // MapleMob 형식으로 변환
      const convertedMobs = filteredData.map((monster: any) => ({
        id: monster.id,
        name: monster.name,
        level: monster.level || 0,
        hp: monster.hp || 0,
        mp: monster.mp || 0,
        exp: monster.exp || 0,
        description: monster.description,
        icon: `https://maplestory.io/api/KMS/389/mob/${monster.id}/icon`,
      })) as MapleMob[];

      setMobs(convertedMobs);
      setFilteredMobs(convertedMobs);
    } catch (error) {
      console.error('❌ 필터링 실패:', error);
      message.error('데이터 필터링에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [monsters, levelRange, monsterType, specialType, monstersLoaded, message]);

  // 검색 및 정렬 적용
  useEffect(() => {
    let filtered = [...mobs];

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

    setFilteredMobs(filtered);
    setCurrentPage(1);
  }, [mobs, searchQuery, sortBy]);

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
  if (!monstersLoaded) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" spinning={true} tip="전역 스토어에서 몬스터 데이터 로딩 중...">
            <div style={{ minHeight: '200px' }} />
          </Spin>
          <div style={{ marginTop: '20px', color: '#666' }}>
            전역 데이터 스토어에서 몬스터 정보를 가져오는 중입니다...
          </div>
        </div>
      </MainLayout>
    );
  }

  // 페이지네이션
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedMobs = filteredMobs.slice(startIndex, startIndex + pageSize);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <Title level={2}>몬스터 정보</Title>
          <Paragraph>
            메이플스토리의 다양한 몬스터 정보를 검색하고 확인할 수 있습니다.
            <br />
            📊 총 {Object.keys(monsters).length?.toLocaleString()}개 몬스터 로드됨
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
        <div style={{ 
          padding: '12px 16px', 
          background: '#f5f5f5', 
          borderRadius: '6px',
          marginBottom: '16px' 
        }}>
          <span>
            {LEVEL_RANGES.find(range => range.value === levelRange)?.label}
            {monsterType !== 'all' && ` · ${MONSTER_TYPES.find(type => type.value === monsterType)?.label}`}
            {specialType !== 'all' && ` · ${SPECIAL_TYPES.find(type => type.value === specialType)?.label}`}
            : {filteredMobs.length.toLocaleString()}개
            {searchQuery && ` (검색어: "${searchQuery}")`}
          </span>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <MobList mobs={paginatedMobs} loading={loading} onMobClick={handleMobClick} />
        </div>

        {!loading && filteredMobs.length > 0 && (
          <div className="flex justify-center mt-8">
            <Pagination
              current={currentPage}
              total={filteredMobs.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
              showSizeChanger={false}
              showTotal={(total, range) => `${range[0]}-${range[1]} / 총 ${total}개`}
            />
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