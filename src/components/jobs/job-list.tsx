'use client';

import { Row, Col, Card, Typography, Tag } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { MapleJob } from '@/types/maplestory';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { useTheme } from '@/components/providers/theme-provider';

const { Title, Text, Paragraph } = Typography;

interface JobListProps {
  jobs: MapleJob[];
  loading?: boolean;
  onJobClick: (jobId: number) => void;
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'beginner': return '#8c8c8c';
    case 'warrior': return '#cf1322';
    case 'magician': return '#1890ff';
    case 'archer': return '#52c41a';
    case 'thief': return '#722ed1';
    default: return '#8c8c8c';
  }
};

const getCategoryName = (category: string) => {
  switch (category) {
    case 'beginner': return '초보자';
    case 'warrior': return '전사';
    case 'magician': return '마법사';
    case 'archer': return '궁수';
    case 'thief': return '도적';
    default: return '기타';
  }
};

const getAdvancementName = (advancement: number) => {
  switch (advancement) {
    case 0: return '초보자';
    case 1: return '1차 전직';
    case 2: return '2차 전직';
    case 3: return '3차 전직';
    case 4: return '4차 전직';
    default: return '기타';
  }
};

export const JobList: React.FC<JobListProps> = ({ jobs, loading = false, onJobClick }) => {
  const { theme: currentTheme } = useTheme();
  if (loading) {
    return (
      <Row gutter={[16, 16]}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6} xl={6}>
            <Card loading={true} />
          </Col>
        ))}
      </Row>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600" style={{ 
        textAlign: 'center', 
        padding: '40px',
        borderRadius: '8px',
        border: '1px dashed'
      }}>
        <TeamOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
        <Title level={4} className="text-gray-500 dark:text-gray-400">
          직업 정보가 없습니다
        </Title>
        <Text className="text-gray-500 dark:text-gray-400">
          검색 조건을 변경해보세요.
        </Text>
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {jobs.map((job) => (
        <Col key={job.id} xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card
            hoverable
            onClick={() => onJobClick(job.id)}
            style={{ 
              height: '100%',
              borderColor: getCategoryColor(job.category),
              borderWidth: '2px'
            }}
            styles={{
              body: { 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                height: '100%'
              }
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <TeamOutlined 
                style={{ 
                  fontSize: '32px', 
                  color: getCategoryColor(job.category),
                  marginBottom: '8px'
                }} 
              />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <Title 
                  level={5} 
                  style={{ 
                    margin: 0, 
                    flex: 1, 
                    color: currentTheme === 'dark' ? '#ffffff' : '#262626' 
                  }}
                >
                  {job.name}
                </Title>
                <FavoriteButton
                  item={{
                    id: job.id,
                    type: 'job',
                    name: job.name,
                    icon: 'job',
                    meta: {
                      category: job.category,
                      advancement: job.advancement,
                      description: job.description,
                    }
                  }}
                  size="small"
                  type="text"
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <Tag color={getCategoryColor(job.category)}>
                  {getCategoryName(job.category)}
                </Tag>
                <Tag color="blue">
                  {getAdvancementName(job.advancement)}
                </Tag>
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <Paragraph 
                ellipsis={{ rows: 2 }} 
                className="text-gray-600 dark:text-gray-400"
                style={{ 
                  fontSize: '12px', 
                  margin: 0,
                  marginBottom: '8px'
                }}
              >
                {job.description}
              </Paragraph>
            </div>

            {job.stats && (
              <div 
                style={{ 
                  marginTop: 'auto',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  backgroundColor: currentTheme === 'dark' ? '#374151' : '#f3f4f6',
                  color: currentTheme === 'dark' ? '#ffffff' : '#374151'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>STR: {job.stats.str}</span>
                  <span>DEX: {job.stats.dex}</span>
                  <span>INT: {job.stats.int}</span>
                  <span>LUK: {job.stats.luk}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>HP: {job.stats.hp}</span>
                  <span>MP: {job.stats.mp}</span>
                </div>
              </div>
            )}

            {job.weapon && job.weapon.length > 0 && (
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <Text className="text-gray-500 dark:text-gray-400" style={{ fontSize: '10px' }}>
                  무기: {job.weapon.join(', ')}
                </Text>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};