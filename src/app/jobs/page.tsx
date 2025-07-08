'use client';

import { useState, useCallback, useMemo } from 'react';
import { Typography, Row, Col, Input, Select, Card, Space } from 'antd';
import { SearchOutlined, TeamOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { JobList } from '@/components/jobs/job-list';
import { JobDetailModal } from '@/components/jobs/job-detail-modal';
import { useJobs } from '@/hooks/useMapleData';
import debounce from 'lodash.debounce';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAdvancement, setSelectedAdvancement] = useState<number | 'all'>('all');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 직업 데이터 가져오기
  const { data: allJobs = [], isLoading, error } = useJobs();

  // 디바운스된 검색 핸들러
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query);
    }, 300),
    []
  );

  const handleSearch = useCallback((value: string) => {
    debouncedSearch(value);
  }, [debouncedSearch]);

  // 필터링된 직업 목록
  const filteredJobs = useMemo(() => {
    let filtered = allJobs;

    // 검색어 필터링
    if (searchQuery.length >= 1) {
      filtered = filtered.filter(job => 
        job.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(job => job.category === selectedCategory);
    }

    // 전직 차수 필터링
    if (selectedAdvancement !== 'all') {
      filtered = filtered.filter(job => job.advancement === selectedAdvancement);
    }

    return filtered;
  }, [allJobs, searchQuery, selectedCategory, selectedAdvancement]);

  // 직업 클릭 핸들러
  const handleJobClick = (jobId: number) => {
    setSelectedJobId(jobId);
    setModalOpen(true);
  };

  // 모달 닫기
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedJobId(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <Title level={2}>직업 정보</Title>
          <Paragraph>
            메이플스토리의 다양한 직업 정보를 확인할 수 있습니다.
            <br />
            💡 직업명을 검색하거나 카테고리별로 필터링하여 원하는 직업을 찾아보세요.
          </Paragraph>
        </div>

        {/* 통계 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {allJobs.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>전체 직업</div>
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {filteredJobs.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>검색 결과</div>
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                {new Set(allJobs.map(job => job.category)).size}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>직업 계열</div>
            </Card>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                {Math.max(...allJobs.map(job => job.advancement))}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>최대 전직</div>
            </Card>
          </Col>
        </Row>

        {/* 검색 및 필터 */}
        <div style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: '8px', fontWeight: 500 }}>직업 검색</div>
              <Search
                placeholder="직업명을 입력하세요"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={handleSearch}
              />
            </Col>
            <Col xs={24} sm={6} md={4}>
              <div style={{ marginBottom: '8px', fontWeight: 500 }}>직업 계열</div>
              <Select
                style={{ width: '100%' }}
                size="large"
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="계열 선택"
              >
                <Option value="all">전체</Option>
                <Option value="beginner">초보자</Option>
                <Option value="warrior">전사</Option>
                <Option value="magician">마법사</Option>
                <Option value="archer">궁수</Option>
                <Option value="thief">도적</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <div style={{ marginBottom: '8px', fontWeight: 500 }}>전직 차수</div>
              <Select
                style={{ width: '100%' }}
                size="large"
                value={selectedAdvancement}
                onChange={setSelectedAdvancement}
                placeholder="전직 선택"
              >
                <Option value="all">전체</Option>
                <Option value={0}>초보자</Option>
                <Option value={1}>1차</Option>
                <Option value={2}>2차</Option>
                <Option value={3}>3차</Option>
                <Option value={4}>4차</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* 검색 결과 정보 */}
        {(searchQuery || selectedCategory !== 'all' || selectedAdvancement !== 'all') && (
          <div style={{ 
            padding: '12px 16px', 
            background: '#f5f5f5', 
            borderRadius: '6px',
            marginBottom: '16px' 
          }}>
            <Space>
              {searchQuery && <span>검색어: &quot;{searchQuery}&quot;</span>}
              {selectedCategory !== 'all' && <span>계열: {selectedCategory}</span>}
              {selectedAdvancement !== 'all' && <span>전직: {selectedAdvancement}차</span>}
              <span>· {filteredJobs.length}개 직업 발견</span>
            </Space>
          </div>
        )}

        {/* 직업 목록 */}
        <JobList 
          jobs={filteredJobs} 
          loading={isLoading} 
          onJobClick={handleJobClick} 
        />

        {/* 에러 상태 */}
        {error && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px',
            background: '#fff2f0',
            borderRadius: '8px',
            border: '1px dashed #ffccc7'
          }}>
            <TeamOutlined style={{ fontSize: '48px', color: '#ff7875', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#cf1322' }}>
              직업 정보를 불러올 수 없습니다
            </Title>
            <Paragraph style={{ color: '#a8071a' }}>
              잠시 후 다시 시도해주세요.
            </Paragraph>
          </div>
        )}

        {/* 직업 상세 모달 */}
        <JobDetailModal
          jobId={selectedJobId}
          open={modalOpen}
          onClose={handleModalClose}
        />
      </div>
    </MainLayout>
  );
}