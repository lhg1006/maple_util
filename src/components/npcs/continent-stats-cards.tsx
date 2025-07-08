'use client';

import { Card, Row, Col, Typography, Badge, Progress, Statistic } from 'antd';
import { 
  EnvironmentOutlined, 
  UserOutlined, 
  TrophyOutlined,
  RocketOutlined,
  CrownOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import { useMapsSummary } from '@/hooks/useMapleData';

const { Title, Text } = Typography;

interface ContinentStatsCardsProps {
  onContinentSelect: (continent: string) => void;
  selectedContinent?: string;
}

// 대륙별 아이콘 및 설명
const getContinentInfo = (continent: string) => {
  const infoMap: Record<string, { icon: React.ReactNode; description: string; level: string; color: string }> = {
    '메이플 로드': { 
      icon: <UserOutlined />, 
      description: '초보자 지역', 
      level: 'Lv.1-10', 
      color: '#52c41a' 
    },
    '빅토리아 아일랜드': { 
      icon: <EnvironmentOutlined />, 
      description: '기본 마을들', 
      level: 'Lv.10-70', 
      color: '#1890ff' 
    },
    '엘나스': { 
      icon: <EnvironmentOutlined />, 
      description: '눈의 도시', 
      level: 'Lv.50-70', 
      color: '#40a9ff' 
    },
    '오르비스': { 
      icon: <RocketOutlined />, 
      description: '하늘 도시', 
      level: 'Lv.60-80', 
      color: '#722ed1' 
    },
    '루디브리엄': { 
      icon: <ThunderboltOutlined />, 
      description: '시계탑', 
      level: 'Lv.70-120', 
      color: '#722ed1' 
    },
    '아쿠아로드': { 
      icon: <EnvironmentOutlined />, 
      description: '바다의 길', 
      level: 'Lv.70-120', 
      color: '#13c2c2' 
    },
    '리프레': { 
      icon: <CrownOutlined />, 
      description: '용의 대륙', 
      level: 'Lv.120-200', 
      color: '#52c41a' 
    },
    '무릉 지역': { 
      icon: <TrophyOutlined />, 
      description: '무릉도원 & 도장', 
      level: 'Lv.120+', 
      color: '#fa8c16' 
    },
    '니할사막': { 
      icon: <EnvironmentOutlined />, 
      description: '사막 지역', 
      level: 'Lv.90-120', 
      color: '#d4b106' 
    },
    '마가티아': { 
      icon: <ThunderboltOutlined />, 
      description: '연금술의 도시', 
      level: 'Lv.80-120', 
      color: '#fa541c' 
    },
    '에델슈타인': { 
      icon: <RocketOutlined />, 
      description: '저항군 본거지', 
      level: 'Lv.30-200', 
      color: '#f5222d' 
    },
    '아르카나': { 
      icon: <CrownOutlined />, 
      description: '고급 사냥터', 
      level: 'Lv.225+', 
      color: '#722ed1' 
    },
    '모라스': { 
      icon: <CrownOutlined />, 
      description: '고급 사냥터', 
      level: 'Lv.230+', 
      color: '#531dab' 
    },
    '에스페라': { 
      icon: <CrownOutlined />, 
      description: '고급 사냥터', 
      level: 'Lv.235+', 
      color: '#9254de' 
    },
    '레헬른': { 
      icon: <CrownOutlined />, 
      description: '고급 사냥터', 
      level: 'Lv.220+', 
      color: '#b37feb' 
    },
    '츄츄 아일랜드': { 
      icon: <CrownOutlined />, 
      description: '고급 사냥터', 
      level: 'Lv.210+', 
      color: '#d3adf7' 
    },
    '얌얌 아일랜드': { 
      icon: <CrownOutlined />, 
      description: '고급 사냥터', 
      level: 'Lv.215+', 
      color: '#efdbff' 
    },
    '세르니움': { 
      icon: <CrownOutlined />, 
      description: '최신 고급 지역', 
      level: 'Lv.245+', 
      color: '#f759ab' 
    },
    '호텔 아르크스': { 
      icon: <CrownOutlined />, 
      description: '최신 고급 지역', 
      level: 'Lv.250+', 
      color: '#ff85c0' 
    },
    '오디움': { 
      icon: <CrownOutlined />, 
      description: '최신 고급 지역', 
      level: 'Lv.255+', 
      color: '#ffadd2' 
    },
    '도원경': { 
      icon: <CrownOutlined />, 
      description: '최신 고급 지역', 
      level: 'Lv.260+', 
      color: '#ffd6e7' 
    },
    '카르시온': { 
      icon: <CrownOutlined />, 
      description: '최신 고급 지역', 
      level: 'Lv.265+', 
      color: '#fff0f6' 
    }
  };

  return infoMap[continent] || { 
    icon: <EnvironmentOutlined />, 
    description: '기타 지역', 
    level: '다양', 
    color: '#666666' 
  };
};

export const ContinentStatsCards: React.FC<ContinentStatsCardsProps> = ({ 
  onContinentSelect, 
  selectedContinent 
}) => {
  const { data: summary, isLoading } = useMapsSummary();

  if (isLoading || !summary) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div>대륙 통계를 불러오는 중...</div>
      </div>
    );
  }

  // 대륙을 종류별로 분류
  const continentCategories = {
    '초보/중급': ['메이플 로드', '빅토리아 아일랜드', '엘나스', '오르비스', '루디브리엄', '아쿠아로드'],
    '중급/고급': ['리프레', '무릉 지역', '니할사막', '마가티아', '에델슈타인'],
    '고급 사냥터': ['아르카나', '모라스', '에스페라', '레헬른', '츄츄 아일랜드', '얌얌 아일랜드'],
    '최신 지역': ['세르니움', '호텔 아르크스', '오디움', '도원경', '카르시온'],
    '특수 지역': ['커닝시티', '에레브', '지구방위본부', '크리티아스', '요정계', '버섯 왕국', '해상 지역'],
    '컨텐츠': ['테마파크 & 이벤트', '던전 & 미궁', '스토리 & 퀘스트', '도시 & 학교', '히든 & 특수']
  };

  const totalMaps = summary.totalMaps;

  const renderContinentCard = (continent: string, count: number) => {
    const info = getContinentInfo(continent);
    const percentage = (count / totalMaps * 100).toFixed(1);
    const isSelected = selectedContinent === continent;

    return (
      <Col xs={24} sm={12} md={8} lg={6} xl={4} key={continent}>
        <Card
          hoverable
          onClick={() => onContinentSelect(continent)}
          style={{
            cursor: 'pointer',
            border: isSelected ? `2px solid ${info.color}` : '1px solid #e8e8e8',
            backgroundColor: isSelected ? `${info.color}10` : 'white',
            transition: 'all 0.3s ease'
          }}
          styles={{
            body: {
              padding: '16px',
              textAlign: 'center'
            }
          }}
        >
          <div style={{ 
            fontSize: '32px', 
            color: info.color, 
            marginBottom: '12px' 
          }}>
            {info.icon}
          </div>
          
          <Title 
            level={5} 
            style={{ 
              margin: '0 0 8px 0', 
              fontSize: '14px',
              fontWeight: 600 
            }}
            ellipsis={{ tooltip: continent }}
          >
            {continent}
          </Title>
          
          <Text 
            style={{ 
              fontSize: '12px', 
              color: '#666',
              display: 'block',
              marginBottom: '8px'
            }}
          >
            {info.description}
          </Text>
          
          <Badge 
            count={info.level} 
            style={{ 
              backgroundColor: info.color,
              fontSize: '10px',
              marginBottom: '12px'
            }}
          />
          
          <div style={{ marginTop: '12px' }}>
            <Statistic
              value={count}
              suffix="개 맵"
              valueStyle={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: info.color
              }}
            />
            
            <Progress
              percent={parseFloat(percentage)}
              size="small"
              strokeColor={info.color}
              showInfo={false}
              style={{ marginTop: '8px' }}
            />
            
            <Text style={{ fontSize: '11px', color: '#999' }}>
              전체의 {percentage}%
            </Text>
          </div>
        </Card>
      </Col>
    );
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Title level={3} style={{ margin: '0 0 8px 0' }}>
          🗺️ 대륙별 탐색
        </Title>
        <Text style={{ color: '#666' }}>
          원하는 대륙을 선택하여 해당 지역의 맵과 NPC를 탐색해보세요
        </Text>
      </div>

      {Object.entries(continentCategories).map(([category, continents]) => {
        const categoryMaps = continents
          .filter(continent => summary.continentStats[continent])
          .map(continent => ({ continent, count: summary.continentStats[continent] }));
        
        if (categoryMaps.length === 0) return null;

        return (
          <div key={category} style={{ marginBottom: '32px' }}>
            <Title level={4} style={{ margin: '0 0 16px 0', color: '#333' }}>
              {category}
            </Title>
            <Row gutter={[16, 16]}>
              {categoryMaps.map(({ continent, count }) => 
                renderContinentCard(continent, count)
              )}
            </Row>
          </div>
        );
      })}

      {/* 기타 지역은 별도로 표시 */}
      {summary.continentStats['기타 지역'] && (
        <div style={{ marginTop: '32px' }}>
          <Title level={4} style={{ margin: '0 0 16px 0', color: '#999' }}>
            기타
          </Title>
          <Row gutter={[16, 16]}>
            {renderContinentCard('기타 지역', summary.continentStats['기타 지역'])}
          </Row>
        </div>
      )}
    </div>
  );
};