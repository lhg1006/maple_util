'use client';

import { useState, useCallback, useMemo } from 'react';
import { Typography, Row, Col, Input, Select, Card, Space } from 'antd';
import { SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { SkillList } from '@/components/skills/skill-list';
import { SkillDetailModal } from '@/components/skills/skill-detail-modal';
import { useJobs, useSkills } from '@/hooks/useMapleData';
import { useTheme } from '@/components/providers/theme-provider';
import debounce from 'lodash.debounce';

const { Title, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

export default function SkillsPage() {
  const { theme: currentTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedElement, setSelectedElement] = useState<string>('all');
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 직업 및 스킬 데이터 가져오기
  const { data: allJobs = [], isLoading: isJobsLoading } = useJobs();
  const { data: allSkills = [], isLoading: isSkillsLoading, error } = useSkills();
  
  const isLoading = isJobsLoading || isSkillsLoading;

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

  // 필터링된 스킬 목록 - 직업이 선택되었을 때만 스킬 표시
  const filteredSkills = useMemo(() => {
    // 직업이 선택되지 않은 경우 빈 배열 반환
    if (!selectedJobId) {
      return [];
    }

    let filtered = allSkills.filter((skill: any) => skill.jobId === selectedJobId);

    // 검색어 필터링
    if (searchQuery.length >= 1) {
      filtered = filtered.filter((skill: any) => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 타입 필터링
    if (selectedType !== 'all') {
      filtered = filtered.filter((skill: any) => skill.type === selectedType);
    }

    // 속성 필터링
    if (selectedElement !== 'all') {
      filtered = filtered.filter((skill: any) => skill.element === selectedElement);
    }

    return filtered;
  }, [allSkills, searchQuery, selectedJobId, selectedType, selectedElement]);

  // 선택된 직업 정보
  const selectedJob = useMemo(() => {
    return allJobs.find((job: any) => job.id === selectedJobId);
  }, [allJobs, selectedJobId]);

  // 스킬 클릭 핸들러
  const handleSkillClick = (skillId: number) => {
    setSelectedSkillId(skillId);
    setModalOpen(true);
  };

  // 모달 닫기
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSkillId(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <Title level={2}>스킬 정보</Title>
          <Paragraph>
            메이플스토리의 다양한 스킬 정보를 확인할 수 있습니다.
            <br />
            💡 먼저 직업을 선택한 후, 해당 직업의 스킬을 검색하거나 필터링할 수 있습니다.
          </Paragraph>
        </div>

        {/* 통계 카드 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={6} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                {allJobs.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>전체 직업</div>
            </Card>
          </Col>
          <Col xs={24} sm={6} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                {selectedJobId ? filteredSkills.length : 0}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>보유 스킬</div>
            </Card>
          </Col>
          <Col xs={24} sm={6} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                {allSkills.length}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>전체 스킬</div>
            </Card>
          </Col>
          <Col xs={24} sm={6} md={6}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                {new Set(allSkills.map(skill => skill.type)).size}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>스킬 타입</div>
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
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: '8px', fontWeight: 500 }}>직업 선택 (필수)</div>
              <Select
                style={{ width: '100%' }}
                size="large"
                value={selectedJobId}
                onChange={setSelectedJobId}
                placeholder="먼저 직업을 선택하세요"
                showSearch
                filterOption={(input, option) =>
                  option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
                }
              >
                {allJobs.map(job => (
                  <Option key={job.id} value={job.id}>
                    {job.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <div style={{ marginBottom: '8px', fontWeight: 500 }}>스킬 검색</div>
              <Search
                placeholder="스킬명을 입력하세요"
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                disabled={!selectedJobId}
                onChange={(e) => handleSearch(e.target.value)}
                onSearch={handleSearch}
              />
            </Col>
            <Col xs={24} sm={6} md={4}>
              <div style={{ marginBottom: '8px', fontWeight: 500 }}>스킬 타입</div>
              <Select
                style={{ width: '100%' }}
                size="large"
                value={selectedType}
                onChange={setSelectedType}
                placeholder="타입 선택"
                disabled={!selectedJobId}
              >
                <Option value="all">전체</Option>
                <Option value="active">액티브</Option>
                <Option value="passive">패시브</Option>
                <Option value="buff">버프</Option>
                <Option value="debuff">디버프</Option>
                <Option value="summon">소환</Option>
              </Select>
            </Col>
            <Col xs={24} sm={6} md={4}>
              <div style={{ marginBottom: '8px', fontWeight: 500 }}>속성</div>
              <Select
                style={{ width: '100%' }}
                size="large"
                value={selectedElement}
                onChange={setSelectedElement}
                placeholder="속성 선택"
                disabled={!selectedJobId}
              >
                <Option value="all">전체</Option>
                <Option value="fire">불</Option>
                <Option value="ice">얼음</Option>
                <Option value="lightning">번개</Option>
                <Option value="poison">독</Option>
                <Option value="holy">성</Option>
                <Option value="dark">어둠</Option>
                <Option value="physical">물리</Option>
                <Option value="heal">회복</Option>
                <Option value="none">무속성</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* 선택된 직업 정보 */}
        {selectedJob && (
          <div style={{ 
            padding: '16px', 
            background: '#f0f8ff', 
            borderRadius: '8px',
            marginBottom: '16px',
            border: '1px solid #b7eb8f'
          }}>
            <Space>
              <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                선택된 직업: {selectedJob.name}
              </span>
              {searchQuery && <span>· 검색어: &quot;{searchQuery}&quot;</span>}
              {selectedType !== 'all' && <span>· 타입: {selectedType}</span>}
              {selectedElement !== 'all' && <span>· 속성: {selectedElement}</span>}
              <span>· {filteredSkills.length}개 스킬 발견</span>
            </Space>
          </div>
        )}

        {/* 직업 선택 안내 */}
        {!selectedJobId && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center',
            background: currentTheme === 'dark' ? '#1f2937' : '#fafafa',
            borderRadius: '8px',
            border: currentTheme === 'dark' ? '1px dashed #4b5563' : '1px dashed #d9d9d9',
            marginBottom: '24px'
          }}>
            <ThunderboltOutlined style={{ 
              fontSize: '48px', 
              color: currentTheme === 'dark' ? '#6b7280' : '#bfbfbf', 
              marginBottom: '16px' 
            }} />
            <Title level={4} style={{ 
              color: currentTheme === 'dark' ? '#9ca3af' : '#8c8c8c' 
            }}>
              직업을 선택해주세요
            </Title>
            <Paragraph style={{ 
              color: currentTheme === 'dark' ? '#9ca3af' : '#8c8c8c' 
            }}>
              스킬을 보려면 먼저 직업을 선택해야 합니다.
            </Paragraph>
          </div>
        )}

        {/* 스킬 목록 */}
        {selectedJobId && (
          <SkillList 
            skills={filteredSkills} 
            loading={isLoading} 
            onSkillClick={handleSkillClick} 
          />
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center p-10 bg-red-50 dark:bg-red-950/20 rounded-lg border-2 border-dashed border-red-200 dark:border-red-800">
            <ThunderboltOutlined style={{ fontSize: '48px', color: '#ff7875', marginBottom: '16px' }} />
            <Title level={4} style={{ color: '#cf1322' }}>
              스킬 정보를 불러올 수 없습니다
            </Title>
            <Paragraph style={{ color: '#a8071a' }}>
              잠시 후 다시 시도해주세요.
            </Paragraph>
          </div>
        )}

        {/* 스킬 상세 모달 */}
        <SkillDetailModal
          skillId={selectedSkillId}
          open={modalOpen}
          onClose={handleModalClose}
        />
      </div>
    </MainLayout>
  );
}