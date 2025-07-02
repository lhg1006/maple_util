'use client';

import { useState, useCallback, useEffect } from 'react';
import { Typography, Row, Col, Pagination, Input, Select, App } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { MobList } from '@/components/mobs/mob-list';
import { MobDetailModal } from '@/components/mobs/mob-detail-modal';
import { MapleMob } from '@/types/maplestory';
import { mapleAPI } from '@/lib/api';
import { COMPLETE_MONSTERS } from '@/data/complete-monsters';
import { COMPLETE_ITEMS } from '@/data/complete-items';
import { COMPLETE_MAPS } from '@/data/complete-maps';
import debounce from 'lodash.debounce';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function MobsPage() {
  const { message } = App.useApp();
  const [mobs, setMobs] = useState<MapleMob[]>([]);
  const [filteredMobs, setFilteredMobs] = useState<MapleMob[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('name');
  const [levelRange, setLevelRange] = useState<string>('all');
  const [selectedMobId, setSelectedMobId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pageSize = 32;

  // 지역별 레벨 분류
  const LEVEL_RANGES = [
    { value: 'all', label: '전체' },
    { value: '1-10', label: '초보자 섬 (1-10)' },
    { value: '11-30', label: '빅토리아 아일랜드 (11-30)' },
    { value: '31-50', label: '오르비스 근처 (31-50)' },
    { value: '51-70', label: '엘나스/루디브리엄 (51-70)' },
    { value: '71-100', label: '중급 지역 (71-100)' },
    { value: '101-150', label: '고급 지역 (101-150)' },
    { value: '151-200', label: '최고급 지역 (151-200)' },
    { value: '200+', label: '보스/특수 (200+)' },
  ];

  // 몬스터 데이터 로드
  useEffect(() => {
    const loadMobs = async () => {
      setLoading(true);
      setCurrentPage(1);
      try {
        // 완전한 데이터베이스 사용
        const localMobs = Object.values(COMPLETE_MONSTERS).map(monster => ({
          id: monster.id,
          name: monster.name,
          level: monster.level,
          hp: monster.hp,
          exp: monster.exp,
        })) as MapleMob[];
        
        console.log(`총 ${localMobs.length}개 몬스터 로드 완료 (로컬 데이터)`);
        setMobs(localMobs);
        setFilteredMobs(localMobs);
        
        // 백그라운드에서 API 데이터도 가져와서 병합 (선택적)
        try {
          const params = {
            startPosition: 0,
            count: 5000,
          };
          
          const apiMobs = await mapleAPI.getMobsByCategory(params);
          const validApiMobs = apiMobs.filter(mob => 
            mob.name && mob.name.trim() !== '' && mob.name !== 'null'
          );
          
          // 로컬 데이터에 없는 몬스터들만 추가
          const existingIds = new Set(localMobs.map(m => m.id));
          const newMobs = validApiMobs.filter(mob => !existingIds.has(mob.id));
          
          if (newMobs.length > 0) {
            const combinedMobs = [...localMobs, ...newMobs];
            console.log(`API에서 ${newMobs.length}개 추가 몬스터 발견, 총 ${combinedMobs.length}개`);
            setMobs(combinedMobs);
            setFilteredMobs(combinedMobs);
          }
        } catch (apiError) {
          console.warn('API 데이터 로딩 실패, 로컬 데이터만 사용:', apiError);
        }
        
      } catch (error) {
        console.error('몬스터 로딩 실패:', error);
        message.error('몬스터 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadMobs();
  }, [message]);

  // 검색 및 정렬 적용
  useEffect(() => {
    let filtered = [...mobs];

    // 검색 필터
    if (searchQuery.trim()) {
      filtered = filtered.filter(mob => 
        mob.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 레벨 범위 필터
    if (levelRange !== 'all') {
      filtered = filtered.filter(mob => {
        const level = mob.level || 0;
        switch (levelRange) {
          case '1-10':
            return level >= 1 && level <= 10;
          case '11-30':
            return level >= 11 && level <= 30;
          case '31-50':
            return level >= 31 && level <= 50;
          case '51-70':
            return level >= 51 && level <= 70;
          case '71-100':
            return level >= 71 && level <= 100;
          case '101-150':
            return level >= 101 && level <= 150;
          case '151-200':
            return level >= 151 && level <= 200;
          case '200+':
            return level > 200;
          default:
            return true;
        }
      });
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
  }, [mobs, searchQuery, sortBy, levelRange]);

  // 검색 및 정렬 함수
  const filterAndSortMobs = useCallback((query: string, sort: string) => {
    setSearchQuery(query);
    setSortBy(sort);
  }, []);

  // 디바운스된 검색 핸들러
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      filterAndSortMobs(value, sortBy);
    }, 300),
    [filterAndSortMobs, sortBy]
  );

  // 검색 입력 핸들러
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (value: string) => {
    setSortBy(value);
    filterAndSortMobs(searchQuery, value);
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
            {/* 지역 필터 */}
            <Col span={24}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Select
                    style={{ width: '100%' }}
                    size="large"
                    value={levelRange}
                    onChange={setLevelRange}
                    placeholder="지역/레벨 선택"
                  >
                    {LEVEL_RANGES.map(range => (
                      <Option key={range.value} value={range.value}>{range.label}</Option>
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
                    <Option value="level">레벨순</Option>
                    <Option value="name">이름순</Option>
                  </Select>
                </Col>
              </Row>
            </Col>
          </Row>
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