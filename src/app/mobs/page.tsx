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
  const [loading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [hasMoreMobs, setHasMoreMobs] = useState(true);
  const [totalLoadedMobs, setTotalLoadedMobs] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('level');
  const [selectedMobId, setSelectedMobId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const pageSize = 32;
  const batchSize = 500;


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
      return true;
    }
    
    try {
      console.log(`🚀 페이지 ${targetPage} 점프를 위한 데이터 로드 시작...`);
      
      const allMobs = [...mobs];
      let currentPosition = totalLoadedMobs;
      
      while (allMobs.length < requiredMobs && hasMoreMobs) {
        const newMobs = await mapleAPI.getMobsByCategory({
          startPosition: currentPosition,
          count: batchSize
        });
        
        if (newMobs.length === 0) {
          setHasMoreMobs(false);
          break;
        }
        
        allMobs.push(...newMobs);
        currentPosition += newMobs.length;
        
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
    }
  };





  // 데이터 변경 시 기본 필터링 적용
  useEffect(() => {
    if (mobs.length === 0) return;
    setFilteredMobs(mobs);
  }, [mobs]);

  // 검색 및 정렬 적용
  useEffect(() => {
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
  }, [filteredMobs, searchQuery, sortBy]);

  // 검색어나 정렬 기준 변경 시에만 페이지 초기화
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);


  // 검색 핸들러
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    [setSearchQuery]
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
          marginBottom: '32px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={16} md={18}>
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
            총 {displayMobs.length.toLocaleString()}개 몬스터
            {searchQuery && ` (검색어: "${searchQuery}")`}
          </span>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <MobList 
            mobs={paginatedMobs} 
            loading={loading} 
            onMobClick={handleMobClick} 
          />
        </div>

        {!loading && displayMobs.length > 0 && (
          <div>
            <div>
              <div className="flex justify-center mt-8">
                <Pagination
                  current={currentPage}
                  total={displayMobs.length}
                  pageSize={pageSize}
                  onChange={async (page) => {
                    const success = await loadDataForPage(page);
                    if (success) {
                      setCurrentPage(page);
                    }
                  }}
                  showSizeChanger={false}
                  showTotal={(total, range) => {
                    const totalText = hasMoreMobs ? `${total}+` : `${total}`;
                    return `${range[0]}-${range[1]} / 총 ${totalText}개`;
                  }}
                  disabled={false}
                />
              </div>
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