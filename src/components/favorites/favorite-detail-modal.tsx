'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Spin, Card, Typography, Tag, Space, Row, Col, Descriptions, Button } from 'antd';
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

interface DetailData {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  level?: number;
  location?: string;
  category?: string;
  [key: string]: any;
}

export function FavoriteDetailModal({ favorite, open, onClose }: FavoriteDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API 호출 함수
  const fetchDetail = async (favorite: FavoriteItem) => {
    if (!favorite) return null;
    
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      // 각 타입별 API 호출 with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API 호출 시간 초과')), 10000)
      );
      
      switch (favorite.type) {
        case 'item':
          data = await Promise.race([getItemById(favorite.id), timeoutPromise]);
          break;
        case 'npc':
          data = await Promise.race([getNPCById(favorite.id), timeoutPromise]);
          break;
        case 'mob':
          data = await Promise.race([getMobById(favorite.id), timeoutPromise]);
          break;
        case 'job':
          data = await Promise.race([getJobById(favorite.id), timeoutPromise]);
          break;
        case 'skill':
          data = await Promise.race([getSkillById(favorite.id), timeoutPromise]);
          break;
        default:
          throw new Error(`알 수 없는 타입: ${favorite.type}`);
      }
      
      if (!data) {
        throw new Error('API에서 데이터를 받지 못했습니다');
      }
      
      setDetailData(data as DetailData);
    } catch (err: unknown) {
      console.error('Failed to fetch detail:', err);
      
      const error = err as Error;
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        favorite: favorite,
        timestamp: new Date().toISOString()
      });
      
      // 사용자 친화적인 오류 메시지
      let errorMessage = '상세 정보를 불러오는데 실패했습니다.';
      
      if (error?.message?.includes('시간 초과')) {
        errorMessage = '서버 응답이 너무 늦어 요청을 취소했습니다.';
      } else if (error?.message?.includes('404')) {
        errorMessage = '해당 데이터를 찾을 수 없습니다.';
      } else if (error?.message?.includes('Network')) {
        errorMessage = '네트워크 연결에 문제가 있습니다.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
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
          <Space direction="vertical" align="center">
            <div style={{ fontSize: '48px', color: '#ff4d4f' }}>⚠️</div>
            <Text type="danger" style={{ fontSize: '16px' }}>{error}</Text>
            <Button 
              onClick={() => favorite && fetchDetail(favorite)} 
              type="primary" 
              size="small"
            >
              다시 시도
            </Button>
          </Space>
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