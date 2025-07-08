'use client';

import { Modal, Typography, Descriptions, Tag, Divider, Spin } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useMapleJob } from '@/hooks/useMapleData';
import { MapleJob } from '@/types/maplestory';

const { Title, Text, Paragraph } = Typography;

interface JobDetailModalProps {
  jobId: number | null;
  open: boolean;
  onClose: () => void;
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

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ jobId, open, onClose }) => {
  const { data: job, isLoading, error } = useMapleJob(jobId || 0, !!jobId);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>직업 정보를 불러오는 중...</Text>
          </div>
        </div>
      );
    }

    if (error || !job) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <TeamOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
          <Title level={4} style={{ color: '#8c8c8c' }}>
            직업 정보를 불러올 수 없습니다
          </Title>
          <Text style={{ color: '#8c8c8c' }}>
            잠시 후 다시 시도해주세요.
          </Text>
        </div>
      );
    }

    return (
      <div>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <TeamOutlined 
            style={{ 
              fontSize: '48px', 
              color: getCategoryColor(job.category),
              marginBottom: '16px'
            }} 
          />
          <Title level={3} style={{ margin: 0, marginBottom: '8px' }}>
            {job.name}
          </Title>
          <div>
            <Tag color={getCategoryColor(job.category)} style={{ fontSize: '14px', padding: '4px 8px' }}>
              {getCategoryName(job.category)}
            </Tag>
            <Tag color="blue" style={{ fontSize: '14px', padding: '4px 8px' }}>
              {getAdvancementName(job.advancement)}
            </Tag>
          </div>
        </div>

        {/* 설명 */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5}>직업 설명</Title>
          <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {job.description}
          </Paragraph>
        </div>

        <Divider />

        {/* 기본 정보 */}
        <Descriptions title="기본 정보" column={1} size="small" style={{ marginBottom: '24px' }}>
          <Descriptions.Item label="직업 ID">{job.id}</Descriptions.Item>
          <Descriptions.Item label="직업 계열">{getCategoryName(job.category)}</Descriptions.Item>
          <Descriptions.Item label="전직 차수">{getAdvancementName(job.advancement)}</Descriptions.Item>
          {job.weapon && job.weapon.length > 0 && (
            <Descriptions.Item label="사용 가능 무기">
              {job.weapon.map((weapon, index) => (
                <Tag key={index} style={{ margin: '2px' }}>{weapon}</Tag>
              ))}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* 능력치 */}
        {job.stats && (
          <>
            <Divider />
            <div style={{ marginBottom: '24px' }}>
              <Title level={5}>기본 능력치</Title>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '12px',
                background: '#f9f9f9',
                padding: '16px',
                borderRadius: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#d4380d' }}>
                    {job.stats.str}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>힘 (STR)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a' }}>
                    {job.stats.dex}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>민첩 (DEX)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                    {job.stats.int}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>지력 (INT)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#722ed1' }}>
                    {job.stats.luk}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>운 (LUK)</div>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '12px',
                marginTop: '12px',
                background: '#f0f8ff',
                padding: '16px',
                borderRadius: '8px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ff4d4f' }}>
                    {job.stats.hp}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>체력 (HP)</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}>
                    {job.stats.mp}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>마나 (MP)</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      styles={{
        body: { padding: '24px' }
      }}
    >
      {renderContent()}
    </Modal>
  );
};