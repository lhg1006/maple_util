'use client';

import { Row, Col, Card, Typography, Tag, Badge } from 'antd';
import { 
  ThunderboltOutlined, 
  FireOutlined, 
  StarOutlined,
  HeartOutlined,
  EyeOutlined,
  SendOutlined
} from '@ant-design/icons';
import { MapleSkill } from '@/types/maplestory';

const { Title, Text, Paragraph } = Typography;

interface SkillListProps {
  skills: MapleSkill[];
  loading?: boolean;
  onSkillClick: (skillId: number) => void;
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
    case 'active': return '액티브';
    case 'passive': return '패시브';
    case 'buff': return '버프';
    case 'debuff': return '디버프';
    case 'summon': return '소환';
    default: return '기타';
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
    case 'fire': return '불';
    case 'ice': return '얼음';
    case 'lightning': return '번개';
    case 'poison': return '독';
    case 'holy': return '성';
    case 'dark': return '어둠';
    case 'physical': return '물리';
    case 'heal': return '회복';
    case 'none': return '무속성';
    default: return '기타';
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

export const SkillList: React.FC<SkillListProps> = ({ skills, loading = false, onSkillClick }) => {
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

  if (skills.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '40px',
        background: '#fafafa',
        borderRadius: '8px',
        border: '1px dashed #d9d9d9'
      }}>
        <ThunderboltOutlined style={{ fontSize: '48px', color: '#bfbfbf', marginBottom: '16px' }} />
        <Title level={4} style={{ color: '#8c8c8c' }}>
          스킬 정보가 없습니다
        </Title>
        <Text style={{ color: '#8c8c8c' }}>
          검색 조건을 변경해보세요.
        </Text>
      </div>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {skills.map((skill) => (
        <Col key={skill.id} xs={24} sm={12} md={8} lg={6} xl={6}>
          <Card
            hoverable
            onClick={() => onSkillClick(skill.id)}
            style={{ 
              height: '100%',
              borderColor: getTypeColor(skill.type),
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
              <div 
                style={{ 
                  fontSize: '32px', 
                  color: getTypeColor(skill.type),
                  marginBottom: '8px'
                }}
              >
                {getTypeIcon(skill.type)}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
                {skill.name}
              </Title>
              <div style={{ marginBottom: '8px' }}>
                <Tag color={getTypeColor(skill.type)}>
                  {getTypeName(skill.type)}
                </Tag>
                {skill.element !== 'none' && (
                  <Tag color={getElementColor(skill.element)}>
                    {getElementName(skill.element)}
                  </Tag>
                )}
              </div>
            </div>

            <div style={{ flex: 1 }}>
              <Paragraph 
                ellipsis={{ rows: 2 }} 
                style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  margin: 0,
                  marginBottom: '8px'
                }}
              >
                {skill.description}
              </Paragraph>
            </div>

            <div style={{ 
              marginTop: 'auto',
              padding: '8px',
              background: '#f5f5f5',
              borderRadius: '4px',
              fontSize: '11px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>직업: {skill.jobName}</span>
                <span>최대 레벨: {skill.maxLevel}</span>
              </div>
              {skill.preRequisite && (
                <div style={{ fontSize: '10px', color: '#999' }}>
                  선행 스킬: {skill.preRequisite}
                </div>
              )}
            </div>

            {skill.effect && (
              <div style={{ marginTop: '8px', textAlign: 'center' }}>
                <Text style={{ fontSize: '10px', color: '#666', fontStyle: 'italic' }}>
                  {skill.effect.length > 50 ? `${skill.effect.substring(0, 50)}...` : skill.effect}
                </Text>
              </div>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};