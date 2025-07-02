'use client';

import { Modal, Row, Col, Typography, Divider, Image, Spin, Tag, List } from 'antd';
import { MapleMob } from '@/types/maplestory';
import { useState, useEffect } from 'react';
import { mapleAPI } from '@/lib/api';
import { getMonsterDetails, GameData } from '@/utils/game-data';

const { Title, Text, Paragraph } = Typography;

interface MobDetailModalProps {
  mobId: number | null;
  open: boolean;
  onClose: () => void;
}

interface DetailedMob extends MapleMob {
  meta?: {
    isBodyAttack?: boolean;
    level?: number;
    maxHP?: number;
    speed?: number;
    physicalDamage?: number;
    magicDamage?: number;
    accuracy?: number;
    exp?: number;
    minimumPushDamage?: number;
    summonType?: number;
    revivesMonsterId?: number[];
    physicalDefenseRate?: number;
    magicDefenseRate?: number;
  };
  description?: string;
  foundAt?: number[];
}

export const MobDetailModal: React.FC<MobDetailModalProps> = ({ mobId, open, onClose }) => {
  const [mob, setMob] = useState<DetailedMob | null>(null);
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && mobId) {
      loadMobDetails();
    }
  }, [open, mobId]);

  const loadMobDetails = async () => {
    if (!mobId) return;
    
    setLoading(true);
    try {
      // API에서 기본 몬스터 정보 로드
      const mobData = await mapleAPI.getMob(mobId);
      setMob(mobData as DetailedMob);
      
      // 로컬 데이터에서 상세 정보 로드
      const detailedData = getMonsterDetails(mobId);
      setGameData(detailedData);
    } catch (error) {
      console.error('몬스터 상세 정보 로딩 실패:', error);
      // API 실패 시에도 로컬 데이터는 시도
      const detailedData = getMonsterDetails(mobId);
      setGameData(detailedData);
    } finally {
      setLoading(false);
    }
  };

  const getAttackTypeText = (isBodyAttack?: boolean) => {
    return isBodyAttack ? '근접 공격' : '원거리 공격';
  };

  const getLevelColor = (level?: number) => {
    if (!level) return '#666';
    if (level <= 10) return '#52c41a';
    if (level <= 50) return '#1890ff';
    if (level <= 100) return '#fa8c16';
    if (level <= 200) return '#f5222d';
    return '#722ed1';
  };

  return (
    <Modal
      title={<Title level={3} className="!mb-0">{mob?.name || '몬스터 정보'}</Title>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ maxHeight: '80vh' }}
    >
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : mob ? (
        <div className="space-y-6">
          {/* 기본 정보 */}
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <div className="flex justify-center">
                <Image
                  src={`https://maplestory.io/api/KMS/389/mob/${mob.id}/render/stand`}
                  alt={mob.name}
                  style={{ maxHeight: '200px', maxWidth: '200px' }}
                  fallback="/placeholder-monster.png"
                />
              </div>
            </Col>
            <Col xs={24} sm={16}>
              <div className="space-y-4">
                <div>
                  <Title level={4} className="!mb-2">{mob.name}</Title>
                  <Text type="secondary">ID: {mob.id}</Text>
                </div>
                
                {mob.meta && (
                  <div className="space-y-2">
                    <div>
                      <Tag 
                        color={mob.meta.level && mob.meta.level <= 10 ? 'green' : 
                               mob.meta.level && mob.meta.level <= 50 ? 'blue' : 
                               mob.meta.level && mob.meta.level <= 100 ? 'orange' : 
                               mob.meta.level && mob.meta.level <= 200 ? 'red' : 'purple'}
                        style={{ fontSize: '14px', padding: '4px 8px' }}
                      >
                        Lv. {mob.meta.level}
                      </Tag>
                      {mob.meta.isBodyAttack !== undefined && (
                        <Tag color="default" style={{ marginLeft: '8px' }}>
                          {getAttackTypeText(mob.meta.isBodyAttack)}
                        </Tag>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* 스탯 정보 */}
          {mob.meta && (
            <>
              <Divider>스탯 정보</Divider>
              <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold text-red-500">
                      {mob.meta.maxHP?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">최대 HP</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold text-blue-500">
                      {mob.meta.exp?.toLocaleString() || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">경험치</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold text-orange-500">
                      {mob.meta.physicalDamage || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">물리 공격력</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold text-purple-500">
                      {mob.meta.magicDamage || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">마법 공격력</div>
                  </div>
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
                <Col xs={12} sm={6}>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold">
                      {mob.meta.accuracy || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">명중률</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold">
                      {mob.meta.speed || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">이동속도</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold">
                      {mob.meta.physicalDefenseRate || 'N/A'}%
                    </div>
                    <div className="text-xs text-gray-500">물리 방어율</div>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="text-lg font-bold">
                      {mob.meta.magicDefenseRate || 'N/A'}%
                    </div>
                    <div className="text-xs text-gray-500">마법 방어율</div>
                  </div>
                </Col>
              </Row>
            </>
          )}

          {/* 설명 */}
          {mob.description && (
            <>
              <Divider>몬스터 설명</Divider>
              <Paragraph>
                {mob.description.split('\\n').map((line, index) => (
                  <div key={index}>
                    {line}
                    <br />
                  </div>
                ))}
              </Paragraph>
            </>
          )}

          {/* 드롭 아이템 */}
          {gameData && gameData.drops.length > 0 && (
            <>
              <Divider>드롭 아이템</Divider>
              <List
                dataSource={gameData.drops}
                renderItem={(drop) => (
                  <List.Item>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <img
                          src={`https://maplestory.io/api/KMS/389/item/${drop.itemId}/icon`}
                          alt={drop.item.name}
                          style={{ width: '32px', height: '32px' }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                        <div>
                          <Text>{drop.item.name}</Text>
                          <div>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {drop.quantityText}
                            </Text>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tag color={drop.color} style={{ margin: 0 }}>
                          {drop.displayRate}
                        </Tag>
                        {drop.item.category && (
                          <Tag style={{ margin: 0, fontSize: '10px' }}>
                            {drop.item.category}
                          </Tag>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
              <Text type="secondary" style={{ fontSize: '12px', marginTop: '8px' }}>
                * 드롭 정보는 실제와 다를 수 있습니다
              </Text>
            </>
          )}

          {/* 출현 지역 */}
          {gameData && gameData.maps.length > 0 && (
            <>
              <Divider>출현 지역</Divider>
              <div>
                <Text type="secondary">
                  {gameData.maps.length}개 지역에서 발견됨
                </Text>
                <div style={{ marginTop: '8px' }}>
                  {gameData.maps.slice(0, 8).map((map) => (
                    <Tag key={map.id} style={{ margin: '2px' }} color="blue">
                      {map.name}
                    </Tag>
                  ))}
                  {gameData.maps.length > 8 && (
                    <Tag style={{ margin: '2px' }}>
                      +{gameData.maps.length - 8}개 더
                    </Tag>
                  )}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    지역: {gameData.monster.region}
                  </Text>
                </div>
              </div>
            </>
          )}
          
          {/* API 기반 출현 지역 (fallback) */}
          {(!gameData || gameData.maps.length === 0) && mob?.foundAt && mob.foundAt.length > 0 && (
            <>
              <Divider>출현 지역</Divider>
              <div>
                <Text type="secondary">
                  {mob.foundAt.length}개 지역에서 발견됨
                </Text>
                <div style={{ marginTop: '8px' }}>
                  {[...new Set(mob.foundAt)].slice(0, 10).map((mapId, index) => (
                    <Tag key={`${mapId}-${index}`} style={{ margin: '2px' }}>
                      맵 ID: {mapId}
                    </Tag>
                  ))}
                  {mob.foundAt.length > 10 && (
                    <Tag key="more-maps" style={{ margin: '2px' }}>
                      +{mob.foundAt.length - 10}개 더
                    </Tag>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <Text type="secondary">몬스터 정보를 불러올 수 없습니다.</Text>
        </div>
      )}
    </Modal>
  );
};