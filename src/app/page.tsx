'use client';

import { Card, Row, Col, Typography, Space, Statistic } from 'antd';
import { ShoppingOutlined, UserOutlined, BugOutlined, TeamOutlined } from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center mb-8">
          <Title level={1}>메이플랜드 유틸리티에 오신 것을 환영합니다!</Title>
          <Paragraph className="text-lg">
            메이플랜드와 메이플스토리의 모든 정보를 한 곳에서 확인하세요.
          </Paragraph>
        </div>

        <Row gutter={[16, 16]} style={{ width: '100%', margin: 0 }}>
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card className="text-center hover:shadow-md transition-shadow">
              <Statistic
                title="아이템 정보"
                value="10,000+"
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
              <Paragraph className="mt-4">
                다양한 아이템의 상세 정보와 이미지를 확인할 수 있습니다.
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card className="text-center hover:shadow-md transition-shadow">
              <Statistic
                title="NPC 정보"
                value="5,000+"
                prefix={<UserOutlined />}
                valueStyle={{ color: '#cf1322' }}
              />
              <Paragraph className="mt-4">
                게임 내 모든 NPC의 정보와 위치를 검색할 수 있습니다.
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card className="text-center hover:shadow-md transition-shadow">
              <Statistic
                title="몬스터 정보"
                value="3,000+"
                prefix={<BugOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
              <Paragraph className="mt-4">
                몬스터의 능력치와 드롭 아이템 정보를 확인하세요.
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card className="text-center hover:shadow-md transition-shadow">
              <Statistic
                title="직업 & 스킬"
                value="40+"
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <Paragraph className="mt-4">
                모든 직업의 스킬 트리와 상세 정보를 살펴보세요.
              </Paragraph>
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mt-8" style={{ width: '100%', margin: '32px 0 0 0' }}>
          <Col xs={24} md={24} lg={12} xl={12}>
            <Card title="최근 업데이트" className="h-full">
              <Space direction="vertical" size="middle" className="w-full">
                <div>
                  <Title level={5}>메이플랜드 신규 아이템 추가</Title>
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
          
          <Col xs={24} md={24} lg={12} xl={12}>
            <Card title="빠른 시작" className="h-full">
              <Space direction="vertical" size="middle" className="w-full">
                <div>
                  <Title level={5}>1. 카테고리 선택</Title>
                  <Paragraph>
                    왼쪽 메뉴에서 원하는 카테고리(아이템, NPC, 몬스터 등)를 선택하세요.
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
