'use client';

import { Modal, Typography, Descriptions, Tag, Divider, Spin } from 'antd';
import { 
  ThunderboltOutlined, 
  FireOutlined, 
  StarOutlined,
  HeartOutlined,
  EyeOutlined,
  SendOutlined
} from '@ant-design/icons';
import { useMapleSkill } from '@/hooks/useMapleData';
import { MapleSkill } from '@/types/maplestory';

const { Title, Text, Paragraph } = Typography;

interface SkillDetailModalProps {
  skillId: number | null;
  open: boolean;
  onClose: () => void;
}

const getTypeColor = (type: string) => {
  switch (type) {
    case 'active': return '#52c41a';
    case 'passive': return '#1890ff';
    case 'buff': return '#fa8c16';
    case 'debuff': return '#f5222d';
    case 'summon': return '#722ed1';
    default: return '#8c8c8c';
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case 'active': return '액티브 스킬';
    case 'passive': return '패시브 스킬';
    case 'buff': return '버프 스킬';
    case 'debuff': return '디버프 스킬';
    case 'summon': return '소환 스킬';
    default: return '기타 스킬';
  }
};

const getElementColor = (element: string) => {
  switch (element) {
    case 'fire': return '#ff4d4f';
    case 'ice': return '#40a9ff';
    case 'lightning': return '#fadb14';
    case 'poison': return '#52c41a';
    case 'holy': return '#ffd666';
    case 'dark': return '#8c8c8c';
    case 'physical': return '#d4380d';
    case 'heal': return '#95de64';
    default: return '#bfbfbf';
  }
};

const getElementName = (element: string) => {
  switch (element) {
    case 'fire': return '불 속성';
    case 'ice': return '얼음 속성';
    case 'lightning': return '번개 속성';
    case 'poison': return '독 속성';
    case 'holy': return '성 속성';
    case 'dark': return '어둠 속성';
    case 'physical': return '물리 속성';
    case 'heal': return '회복 속성';
    case 'none': return '무속성';
    default: return '기타 속성';
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'active': return <FireOutlined />;
    case 'passive': return <StarOutlined />;
    case 'buff': return <HeartOutlined />;
    case 'debuff': return <EyeOutlined />;
    case 'summon': return <SendOutlined />;
    default: return <ThunderboltOutlined />;
  }
};

export const SkillDetailModal: React.FC<SkillDetailModalProps> = ({ skillId, open, onClose }) => {
  const { data: skill, isLoading, error } = useMapleSkill(skillId || 0, !!skillId);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>스킬 정보를 불러오는 중...</Text>
          </div>
        </div>
      );
    }

    if (error || !skill) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <ThunderboltOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
          <Title level={4} style={{ color: '#8c8c8c' }}>
            스킬 정보를 불러올 수 없습니다
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
          <div 
            style={{ 
              fontSize: '48px', 
              color: getTypeColor(skill.type),
              marginBottom: '16px'
            }}
          >
            {getTypeIcon(skill.type)}
          </div>
          <Title level={3} style={{ margin: 0, marginBottom: '8px' }}>
            {skill.name}
          </Title>
          <div>
            <Tag color={getTypeColor(skill.type)} style={{ fontSize: '14px', padding: '4px 8px' }}>
              {getTypeName(skill.type)}
            </Tag>
            {skill.element !== 'none' && (
              <Tag color={getElementColor(skill.element)} style={{ fontSize: '14px', padding: '4px 8px' }}>
                {getElementName(skill.element)}
              </Tag>
            )}
          </div>
        </div>

        {/* 설명 */}
        <div style={{ marginBottom: '24px' }}>
          <Title level={5}>스킬 설명</Title>
          <Paragraph style={{ fontSize: '14px', lineHeight: '1.6' }}>
            {skill.description}
          </Paragraph>
        </div>

        <Divider />

        {/* 기본 정보 */}
        <Descriptions title="기본 정보" column={1} size="small" style={{ marginBottom: '24px' }}>
          <Descriptions.Item label="스킬 ID">{skill.id}</Descriptions.Item>
          <Descriptions.Item label="소속 직업">{skill.jobName}</Descriptions.Item>
          <Descriptions.Item label="스킬 타입">{getTypeName(skill.type)}</Descriptions.Item>
          <Descriptions.Item label="속성">{getElementName(skill.element)}</Descriptions.Item>
          <Descriptions.Item label="최대 레벨">{skill.maxLevel}</Descriptions.Item>
          {skill.preRequisite && (
            <Descriptions.Item label="선행 스킬">스킬 ID: {skill.preRequisite}</Descriptions.Item>
          )}
        </Descriptions>

        {/* 스킬 효과 */}
        {skill.effect && (
          <>
            <Divider />
            <div style={{ marginBottom: '24px' }}>
              <Title level={5}>스킬 효과</Title>
              <div style={{ 
                background: '#f9f9f9',
                padding: '16px',
                borderRadius: '8px',
                border: `2px solid ${getTypeColor(skill.type)}20`
              }}>
                <Paragraph style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.6',
                  margin: 0,
                  fontFamily: 'monospace'
                }}>
                  {skill.effect}
                </Paragraph>
              </div>
            </div>
          </>
        )}

        {/* 스킬 특성 */}
        <Divider />
        <div style={{ marginBottom: '24px' }}>
          <Title level={5}>스킬 특성</Title>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px',
            background: '#f0f8ff',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: getTypeColor(skill.type) }}>
                {getTypeName(skill.type).replace(' 스킬', '')}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>스킬 타입</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: getElementColor(skill.element) }}>
                {getElementName(skill.element).replace(' 속성', '')}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>속성</div>
            </div>
          </div>
        </div>
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