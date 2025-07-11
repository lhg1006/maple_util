'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Spin, Card, Typography, Tag, Space, Row, Col, Descriptions } from 'antd';
import { 
  ShoppingOutlined, 
  UserOutlined, 
  BugOutlined, 
  TeamOutlined, 
  ThunderboltOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { FavoriteItem } from '@/hooks/useFavorites';
import { getItemById, getNPCById, getMobById, getJobById, getSkillById } from '@/lib/api';

const { Title, Text } = Typography;

interface FavoriteDetailModalProps {
  favorite: FavoriteItem | null;
  open: boolean;
  onClose: () => void;
}

const typeIcons = {
  item: <ShoppingOutlined />,
  npc: <UserOutlined />,
  mob: <BugOutlined />,
  job: <TeamOutlined />,
  skill: <ThunderboltOutlined />,
};

const typeLabels = {
  item: '아이템',
  npc: 'NPC',
  mob: '몬스터',
  job: '직업',
  skill: '스킬',
};

const typeColors = {
  item: '#52c41a',
  npc: '#1890ff',
  mob: '#722ed1',
  job: '#fa8c16',
  skill: '#eb2f96',
};

export function FavoriteDetailModal({ favorite, open, onClose }: FavoriteDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // API 호출 함수
  const fetchDetail = async (favorite: FavoriteItem) => {
    if (!favorite) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      let data;
      switch (favorite.type) {
        case 'item':
          data = await getItemById(favorite.id);
          break;
        case 'npc':
          data = await getNPCById(favorite.id);
          break;
        case 'mob':
          data = await getMobById(favorite.id);
          break;
        case 'job':
          data = await getJobById(favorite.id);
          break;
        case 'skill':
          data = await getSkillById(favorite.id);
          break;
        default:
          throw new Error(`Unknown favorite type: ${favorite.type}`);
      }
      
      if (!data) {
        throw new Error('No data received from API');
      }
      
      setDetailData(data);
    } catch (err: any) {
      console.error('Failed to fetch detail:', err);
      console.error('Error stack:', err?.stack);
      console.error('Favorite:', favorite);
      const errorMessage = err?.message || '상세 정보를 불러오는데 실패했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 모달이 열릴 때 상세 정보 가져오기
  useEffect(() => {
    if (open && favorite) {
      fetchDetail(favorite);
    } else {
      setDetailData(null);
      setError(null);
    }
  }, [open, favorite?.id, favorite?.type]);

  if (!favorite) return null;

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Spin size="large" tip="상세 정보를 불러오는 중...">
            <div style={{ minHeight: '200px' }} />
          </Spin>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Text type="danger">{error}</Text>
        </div>
      );
    }

    if (!detailData) {
      return (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <Text type="secondary">상세 정보를 찾을 수 없습니다.</Text>
        </div>
      );
    }

    return (
      <div>
        <Row gutter={[24, 24]} style={{ height: '100%' }}>
          <Col xs={24} md={8}>
            <Card 
              style={{ height: '100%' }}
              styles={{
                body: {
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  padding: '16px'
                }
              }}
            >
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                width: '100%',
                textAlign: 'center'
              }}>
                {/* 상단 80% - 이미지 영역 */}
                <div style={{ 
                  flex: '0 0 80%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '10px'
                }}>
                  {favorite.icon ? (
                    <img
                      src={favorite.icon}
                      alt={favorite.name}
                      style={{ 
                        width: '180px',
                        height: '180px',
                        objectFit: 'contain' 
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; color: #999; font-size: 64px;">
                              <span>이미지 없음</span>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div style={{ 
                      fontSize: 100, 
                      color: typeColors[favorite.type]
                    }}>
                      {typeIcons[favorite.type]}
                    </div>
                  )}
                </div>
                
                {/* 하단 20% - 이름과 배지 */}
                <div style={{ 
                  flex: '0 0 20%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Title level={4} style={{ margin: 0 }}>{favorite.name}</Title>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Tag color={typeColors[favorite.type]} style={{ margin: 0 }}>
                      {typeLabels[favorite.type]}
                    </Tag>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} md={16}>
            <Card title="상세 정보" style={{ height: '100%' }}>
              <Descriptions 
                column={1} 
                bordered
                styles={{
                  label: {
                    width: '120px', 
                    textAlign: 'center',
                    fontWeight: 'bold',
                    backgroundColor: '#fafafa'
                  },
                  content: {
                    textAlign: 'left',
                    padding: '12px'
                  }
                }}
              >
                <Descriptions.Item label="ID">{favorite.id}</Descriptions.Item>
                <Descriptions.Item label="타입">{typeLabels[favorite.type]}</Descriptions.Item>
                
                {favorite.type === 'item' && detailData && (
                  <>
                    {detailData.description && (
                      <Descriptions.Item label="설명">{detailData.description}</Descriptions.Item>
                    )}
                    {detailData.category && (
                      <Descriptions.Item label="카테고리">{detailData.category}</Descriptions.Item>
                    )}
                    {detailData.subcategory && (
                      <Descriptions.Item label="서브카테고리">{detailData.subcategory}</Descriptions.Item>
                    )}
                    {detailData.cash && (
                      <Descriptions.Item label="캐시 아이템">
                        <Tag color="gold">캐시</Tag>
                      </Descriptions.Item>
                    )}
                    {detailData.price && detailData.price > 0 && (
                      <Descriptions.Item label="가격">{detailData.price.toLocaleString()} 메소</Descriptions.Item>
                    )}
                  </>
                )}
                
                {favorite.type === 'npc' && detailData && (
                  <>
                    {detailData.location && (
                      <Descriptions.Item label="위치">
                        <Space>
                          <EnvironmentOutlined />
                          {detailData.location}
                        </Space>
                      </Descriptions.Item>
                    )}
                    {detailData.description && (
                      <Descriptions.Item label="설명">{detailData.description}</Descriptions.Item>
                    )}
                    {detailData.func && detailData.func !== '' && (
                      <Descriptions.Item label="기능">{detailData.func}</Descriptions.Item>
                    )}
                  </>
                )}
                
                {favorite.type === 'mob' && detailData && (
                  <>
                    {detailData.level && (
                      <Descriptions.Item label="레벨">
                        <Tag color={
                          detailData.level <= 10 ? 'green' : 
                          detailData.level <= 50 ? 'blue' : 
                          detailData.level <= 100 ? 'orange' : 
                          detailData.level <= 200 ? 'red' : 'purple'
                        }>
                          Lv. {detailData.level}
                        </Tag>
                      </Descriptions.Item>
                    )}
                    {detailData.hp && detailData.hp > 0 && (
                      <Descriptions.Item label="HP">{detailData.hp.toLocaleString()}</Descriptions.Item>
                    )}
                    {detailData.mp && detailData.mp > 0 && (
                      <Descriptions.Item label="MP">{detailData.mp.toLocaleString()}</Descriptions.Item>
                    )}
                    {detailData.exp && detailData.exp > 0 && (
                      <Descriptions.Item label="경험치">{detailData.exp.toLocaleString()}</Descriptions.Item>
                    )}
                  </>
                )}
                
                {favorite.type === 'job' && detailData && (
                  <>
                    {detailData.category && (
                      <Descriptions.Item label="분류">{detailData.category}</Descriptions.Item>
                    )}
                    {detailData.advancement && (
                      <Descriptions.Item label="차수">{detailData.advancement}차 전직</Descriptions.Item>
                    )}
                    {detailData.description && (
                      <Descriptions.Item label="설명">{detailData.description}</Descriptions.Item>
                    )}
                  </>
                )}
                
                {favorite.type === 'skill' && detailData && (
                  <>
                    {detailData.jobName && (
                      <Descriptions.Item label="직업">{detailData.jobName}</Descriptions.Item>
                    )}
                    {detailData.maxLevel && (
                      <Descriptions.Item label="최대 레벨">{detailData.maxLevel}</Descriptions.Item>
                    )}
                    {detailData.type && (
                      <Descriptions.Item label="스킬 타입">{detailData.type}</Descriptions.Item>
                    )}
                    {detailData.element && detailData.element !== 'none' && (
                      <Descriptions.Item label="속성">{detailData.element}</Descriptions.Item>
                    )}
                    {detailData.description && (
                      <Descriptions.Item label="설명">{detailData.description}</Descriptions.Item>
                    )}
                  </>
                )}
                
                <Descriptions.Item label={<span>즐겨찾기<br/>추가일</span>}>
                  {new Date(favorite.addedAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Modal
      title={
        <Space>
          {typeIcons[favorite.type]}
          <span>{favorite.name} 상세 정보</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      centered
    >
      {renderContent()}
    </Modal>
  );
}