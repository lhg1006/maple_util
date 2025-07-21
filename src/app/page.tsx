'use client';

import { Card, Row, Col, Typography, Space } from 'antd';
import { ShoppingOutlined, UserOutlined, BugOutlined, SearchOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { useRouter } from 'next/navigation';
import { FlipCard } from '@/components/home/flip-card';
import { FavoritesList } from '@/components/favorites/favorites-list';
import { InstallPrompt } from '@/components/pwa/install-prompt';

const { Title, Paragraph } = Typography;

export default function Home() {
  const router = useRouter();
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <InstallPrompt />
        <div className="text-center mb-8">
          <Title level={1}>메이플스토리 데이터 뷰어</Title>
          <Paragraph className="text-lg">
            게임 정보를 검색하고 즐겨찾기할 수 있습니다.
          </Paragraph>
          <Paragraph className="text-sm" style={{ color: '#ff4d4f', fontWeight: 'bold' }}>
            ⚠️ 이 사이트는 넥슨코리아와 무관한 개인이 운영하는 서비스입니다.
          </Paragraph>
        </div>

        <Row gutter={[24, 24]} justify="center" style={{ width: '100%', margin: 0 }}>
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <div style={{ height: '280px' }}>
              <FlipCard
                title="아이템 정보"
                description="다양한 아이템의 상세 정보와 이미지를 확인할 수 있습니다."
                icon={<ShoppingOutlined />}
                color="#3f8600"
                onClick={() => router.push('/items')}
                type="item"
              />
            </div>
          </Col>
          
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <div style={{ height: '280px' }}>
              <FlipCard
                title="NPC 정보"
                description="게임 내 모든 NPC의 정보와 위치를 검색할 수 있습니다."
                icon={<UserOutlined />}
                color="#cf1322"
                onClick={() => router.push('/npcs')}
                type="npc"
              />
            </div>
          </Col>
          
          <Col xs={24} sm={24} md={8} lg={8} xl={8}>
            <div style={{ height: '280px' }}>
              <FlipCard
                title="몬스터 정보"
                description="몬스터의 능력치와 드롭 아이템 정보를 확인하세요."
                icon={<BugOutlined />}
                color="#722ed1"
                onClick={() => router.push('/mobs')}
                type="mob"
              />
            </div>
          </Col>
        </Row>

        <Row gutter={[24, 24]} className="mt-8" style={{ width: '100%', margin: '48px 0 0 0' }}>
          <Col xs={24} md={12} lg={8} xl={8}>
            <FavoritesList maxItems={5} />
          </Col>
          
          <Col xs={24} md={12} lg={8} xl={8}>
            <Card title="최근 업데이트" className="h-full">
              <Space direction="vertical" size="middle" className="w-full">
                <div>
                  <Title level={5}>메이플스토리 신규 아이템 추가</Title>
                  <Paragraph>
                    최신 업데이트로 추가된 신규 아이템들의 정보가 업데이트되었습니다.
                  </Paragraph>
                </div>
                <div>
                  <Title level={5}>검색 기능 개선</Title>
                  <Paragraph>
                    더욱 빠르고 정확한 검색 기능으로 원하는 정보를 쉽게 찾을 수 있습니다.
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>
          
          <Col xs={24} md={12} lg={8} xl={8}>
            <Card title="빠른 시작" className="h-full">
              <Space direction="vertical" size="middle" className="w-full">
                <div>
                  <Title level={5}>1. 통합 검색 활용</Title>
                  <Paragraph>
                    <SearchOutlined /> 통합 검색에서 아이템, NPC, 몬스터를 한번에 검색할 수 있습니다.
                  </Paragraph>
                </div>
                <div>
                  <Title level={5}>2. 검색 또는 탐색</Title>
                  <Paragraph>
                    검색창을 이용하거나 목록을 탐색하여 원하는 정보를 찾아보세요.
                  </Paragraph>
                </div>
                <div>
                  <Title level={5}>3. 상세 정보 확인</Title>
                  <Paragraph>
                    클릭하면 더 자세한 정보와 이미지를 확인할 수 있습니다.
                  </Paragraph>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
}
