'use client';

import { useState } from 'react';
import { Typography, Tabs, Card, Row, Col } from 'antd';
import { 
  HeartOutlined, 
  ShoppingOutlined, 
  UserOutlined, 
  BugOutlined, 
  TeamOutlined, 
  ThunderboltOutlined 
} from '@ant-design/icons';
import { MainLayout } from '@/components/layout/main-layout';
import { FavoritesList } from '@/components/favorites/favorites-list';
import { useFavorites } from '@/hooks/useFavorites';

const { Title, Paragraph } = Typography;

export default function FavoritesPage() {
  const { favorites, getFavoritesByType } = useFavorites();
  const [activeTab, setActiveTab] = useState('all');

  // 타입별 개수 계산
  const stats = {
    all: favorites.length,
    item: getFavoritesByType('item').length,
    npc: getFavoritesByType('npc').length,
    mob: getFavoritesByType('mob').length,
    job: getFavoritesByType('job').length,
    skill: getFavoritesByType('skill').length,
  };

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <HeartOutlined /> 전체 ({stats.all})
        </span>
      ),
      children: <FavoritesList showHeader={false} />
    },
    {
      key: 'item',
      label: (
        <span>
          <ShoppingOutlined /> 아이템 ({stats.item})
        </span>
      ),
      children: <FavoritesList type="item" showHeader={false} />
    },
    {
      key: 'npc',
      label: (
        <span>
          <UserOutlined /> NPC ({stats.npc})
        </span>
      ),
      children: <FavoritesList type="npc" showHeader={false} />
    },
    {
      key: 'mob',
      label: (
        <span>
          <BugOutlined /> 몬스터 ({stats.mob})
        </span>
      ),
      children: <FavoritesList type="mob" showHeader={false} />
    },
    {
      key: 'job',
      label: (
        <span>
          <TeamOutlined /> 직업 ({stats.job})
        </span>
      ),
      children: <FavoritesList type="job" showHeader={false} />
    },
    {
      key: 'skill',
      label: (
        <span>
          <ThunderboltOutlined /> 스킬 ({stats.skill})
        </span>
      ),
      children: <FavoritesList type="skill" showHeader={false} />
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <Title level={2}>
            <HeartOutlined /> 즐겨찾기
          </Title>
          <Paragraph>
            즐겨찾기한 아이템, NPC, 몬스터, 직업, 스킬을 관리할 수 있습니다.
          </Paragraph>
        </div>

        {/* 통계 카드 */}
        {stats.all > 0 && (
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.all}</div>
                  <div className="text-sm text-gray-500">전체</div>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.item}</div>
                  <div className="text-sm text-gray-500">아이템</div>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.npc}</div>
                  <div className="text-sm text-gray-500">NPC</div>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.mob}</div>
                  <div className="text-sm text-gray-500">몬스터</div>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.job}</div>
                  <div className="text-sm text-gray-500">직업</div>
                </div>
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6} lg={4}>
              <Card size="small">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-600">{stats.skill}</div>
                  <div className="text-sm text-gray-500">스킬</div>
                </div>
              </Card>
            </Col>
          </Row>
        )}

        {/* 즐겨찾기 목록 */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </div>
    </MainLayout>
  );
}