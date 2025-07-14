'use client';

import { Modal, Row, Col, Typography, Divider, Image, Spin, Tag, Card, Progress } from 'antd';
import { MapleMob } from '@/types/maplestory';
import { useState, useEffect } from 'react';
import { mapleAPI } from '@/lib/api';
import { 
  TrophyOutlined, 
  FireOutlined, 
  SafetyOutlined,
  HeartOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  RocketOutlined,
  StarOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface MobDetailModalProps {
  mobId: number | null;
  open: boolean;
  onClose: () => void;
}

interface DetailedMob extends MapleMob {
  // 모든 추가 가능한 필드들
  [key: string]: any;
}

export const MobDetailModal: React.FC<MobDetailModalProps> = ({ mobId, open, onClose }) => {
  const [mob, setMob] = useState<DetailedMob | null>(null);
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
      console.log('🚀 API에서 몬스터 상세 정보 로드 시작:', mobId);
      
      // API에서 몬스터 상세 정보 로드
      const mobData = await mapleAPI.getMob(mobId);
      console.log('✅ API 몬스터 데이터:', mobData);
      console.log('📋 사용 가능한 필드들:', Object.keys(mobData));
      
      if (mobData) {
        console.log('📋 API 응답 구조:', {
          id: mobData.id,
          name: mobData.name,
          linksTo: mobData.linksTo,
          meta: mobData.meta,
          framebooks: mobData.framebooks,
          foundAt: mobData.foundAt
        });
        
        // API 응답을 그대로 사용하되 meta 데이터를 펼쳐서 사용
        const detailedMob: DetailedMob = {
          ...mobData,
          // meta 객체의 데이터를 최상위로 병합
          ...(mobData.meta || {}),
        };
        
        console.log('🔄 변환된 몬스터 데이터:', detailedMob);
        setMob(detailedMob);
      }
    } catch (error) {
      console.error('❌ 몬스터 상세 정보 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttackTypeText = (isBodyAttack?: boolean) => {
    return isBodyAttack ? '근접 공격' : '원거리 공격';
  };


  // 스탯 아이콘 매핑
  const getStatIcon = (statKey: string) => {
    switch (statKey) {
      case 'hp': return <HeartOutlined style={{ color: '#ef4444' }} />;
      case 'mp': return <ThunderboltOutlined style={{ color: '#3b82f6' }} />;
      case 'exp': return <StarOutlined style={{ color: '#10b981' }} />;
      case 'level': return <TrophyOutlined style={{ color: '#f59e0b' }} />;
      case 'pad': case 'mad': return <FireOutlined style={{ color: '#dc2626' }} />;
      case 'pdd': case 'mdd': return <SafetyOutlined style={{ color: '#6b7280' }} />;
      case 'acc': case 'eva': return <EyeOutlined style={{ color: '#8b5cf6' }} />;
      case 'speed': return <RocketOutlined style={{ color: '#06b6d4' }} />;
      default: return <FireOutlined style={{ color: '#9ca3af' }} />;
    }
  };

  // HP/MP 진행바 계산
  const getProgressPercent = (current: number, max: number) => {
    if (!max || max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      styles={{
        body: { 
          padding: 0,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          maxHeight: '85vh',
          overflowY: 'auto'
        }
      }}
      className="monster-detail-modal"
    >
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Spin size="large" />
        </div>
      ) : mob ? (
        <div className="relative">
          {/* 헤더 섹션 */}
          <div 
            className="relative p-4 text-white"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px 8px 0 0'
            }}
          >
            <Row gutter={16} align="top">
              <Col xs={24} sm={6} md={6}>
                <div className="text-center h-full">
                  <div 
                    className="inline-block p-3 rounded-xl shadow-xl h-full flex items-center justify-center"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(15px)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      minHeight: '200px'
                    }}
                  >
                    <Image
                      src={`https://maplestory.io/api/KMS/389/mob/${mob.id}/render/stand`}
                      alt={mob.name}
                      style={{ 
                        maxHeight: '180px', 
                        maxWidth: '180px',
                        width: 'auto',
                        height: 'auto',
                        filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))'
                      }}
                      fallback="/placeholder-monster.png"
                      preview={false}
                    />
                  </div>
                </div>
              </Col>
              <Col xs={24} sm={18} md={18}>
                <div className="space-y-2">
                  <div>
                    <Title 
                      level={3} 
                      className="!text-white !mb-1"
                      style={{ 
                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                        fontSize: '1.8rem'
                      }}
                    >
                      {mob.name}
                    </Title>
                    <div className="space-y-1">
                      <Text className="text-gray-200 text-sm">ID: {mob.id}</Text>
                      {mob.linksTo && (
                        <Text className="text-gray-200 text-xs">
                          연결된 몬스터: {mob.linksTo}
                        </Text>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Tag 
                      icon={<TrophyOutlined />}
                      color={mob.level && mob.level <= 50 ? 'green' : 
                             mob.level && mob.level <= 100 ? 'blue' : 
                             mob.level && mob.level <= 200 ? 'orange' : 'red'}
                      style={{ 
                        fontSize: '12px', 
                        padding: '4px 8px', 
                        borderRadius: '12px',
                        fontWeight: '500'
                      }}
                    >
                      Lv. {mob.level || 'N/A'}
                    </Tag>
                    {(mob.bodyAttack !== undefined || mob.isBodyAttack !== undefined) && (
                      <Tag 
                        icon={<FireOutlined />}
                        color="volcano"
                        style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px' }}
                      >
                        {getAttackTypeText(mob.isBodyAttack ?? mob.bodyAttack)}
                      </Tag>
                    )}
                    {mob.boss && (
                      <Tag 
                        icon={<FireOutlined />}
                        color="red"
                        style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px' }}
                      >
                        보스
                      </Tag>
                    )}
                    {mob.undead && (
                      <Tag 
                        icon={<StarOutlined />}
                        color="purple"
                        style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '8px' }}
                      >
                        언데드
                      </Tag>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="p-4 bg-white">
            {/* 핵심 스탯 카드 (meta 데이터 기반) */}
            <Row gutter={[12, 12]} className="mb-4">
              {[
                { key: 'level', label: '레벨', value: mob.level, color: '#f59e0b', icon: <TrophyOutlined /> },
                { key: 'maxHP', label: '최대 HP', value: mob.maxHP, color: '#ef4444', icon: <HeartOutlined /> },
                { key: 'exp', label: '경험치', value: mob.exp, color: '#10b981', icon: <StarOutlined /> },
                { key: 'isBodyAttack', label: '공격 타입', value: mob.isBodyAttack ? '근접 공격' : '원거리 공격', color: '#8b5cf6', icon: <FireOutlined /> }
              ].filter(stat => stat.value !== null && stat.value !== undefined).map(stat => (
                <Col xs={12} sm={6} key={stat.key}>
                  <div 
                    className="text-center p-3 rounded-lg"
                    style={{ 
                      background: `${stat.color}10`,
                      border: `1px solid ${stat.color}30`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div className="space-y-1">
                      <div style={{ color: stat.color, fontSize: '16px' }}>
                        {stat.icon}
                      </div>
                      <div 
                        className="text-lg font-bold"
                        style={{ color: stat.color }}
                      >
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>

            {/* 전투 능력치 섹션 */}
            <Card 
              title={
                <span>
                  <FireOutlined className="mr-2" style={{ color: '#dc2626' }} />
                  전투 능력치
                </span>
              }
              className="mb-3"
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Row gutter={[12, 12]}>
                {[
                  { key: 'physicalDamage', label: '물리 공격력', value: mob.physicalDamage, color: '#dc2626' },
                  { key: 'magicDamage', label: '마법 공격력', value: mob.magicDamage, color: '#7c3aed' },
                  { key: 'accuracy', label: '명중률', value: mob.accuracy, color: '#f59e0b' },
                  { key: 'speed', label: '이동속도', value: mob.speed, color: '#10b981' },
                  { key: 'minimumPushDamage', label: '최소 밀림 데미지', value: mob.minimumPushDamage, color: '#ef4444' }
                ].filter(stat => stat.value !== null && stat.value !== undefined).map(stat => (
                  <Col xs={12} sm={8} md={6} key={stat.key}>
                    <div 
                      className="p-3 rounded-lg text-center"
                      style={{ 
                        background: `${stat.color}10`,
                        border: `1px solid ${stat.color}30`
                      }}
                    >
                      <div className="mb-1" style={{ color: stat.color, fontSize: '14px' }}>
                        {getStatIcon(stat.key)}
                      </div>
                      <div 
                        className="text-sm font-bold"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {stat.label}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* 방어 능력치 섹션 */}
            <Card 
              title={
                <span>
                  <SafetyOutlined className="mr-2" style={{ color: '#6b7280' }} />
                  방어 능력치
                </span>
              }
              className="mb-3"
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Row gutter={[12, 12]}>
                {[
                  { key: 'physicalDefenseRate', label: '물리 방어율', value: mob.physicalDefenseRate, color: '#6b7280', unit: '%' },
                  { key: 'magicDefenseRate', label: '마법 방어율', value: mob.magicDefenseRate, color: '#6b7280', unit: '%' }
                ].filter(stat => stat.value !== null && stat.value !== undefined).map(stat => (
                  <Col xs={12} sm={6} key={stat.key}>
                    <div 
                      className="p-4 rounded-lg text-center"
                      style={{ 
                        background: `${stat.color}10`,
                        border: `1px solid ${stat.color}30`
                      }}
                    >
                      <div className="mb-2" style={{ color: stat.color }}>
                        {getStatIcon(stat.key)}
                      </div>
                      <div 
                        className="text-lg font-bold"
                        style={{ color: stat.color }}
                      >
                        {stat.value}{stat.unit || ''}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {stat.label}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* 특수 정보 섹션 */}
            <Card 
              title={
                <span>
                  <StarOutlined className="mr-2" style={{ color: '#8b5cf6' }} />
                  특수 정보
                </span>
              }
              className="mb-3"
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            >
              <Row gutter={[12, 12]}>
                {[
                  { key: 'summonType', label: '소환 타입', value: mob.summonType, color: '#8b5cf6' },
                  { key: 'linksToOtherMob', label: '연결된 몬스터', value: mob.linksToOtherMob, color: '#06b6d4' },
                  { key: 'revivesMonsterId', label: '부활시키는 몬스터', value: Array.isArray(mob.revivesMonsterId) && mob.revivesMonsterId.length > 0 ? mob.revivesMonsterId.join(', ') : '없음', color: '#ef4444' }
                ].filter(stat => stat.value !== null && stat.value !== undefined).map(stat => (
                  <Col xs={12} sm={8} md={6} key={stat.key}>
                    <div 
                      className="p-3 rounded-lg text-center"
                      style={{ 
                        background: `${stat.color}10`,
                        border: `1px solid ${stat.color}30`
                      }}
                    >
                      <div className="mb-1" style={{ color: stat.color, fontSize: '14px' }}>
                        <StarOutlined />
                      </div>
                      <div 
                        className="text-sm font-bold"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {stat.label}
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* 특성 정보 */}
            {(mob.category || mob.publicReward || mob.explosive || mob.firstAttack || mob.boss || mob.undead) && (
              <Card 
                title={
                  <span>
                    <StarOutlined className="mr-2" style={{ color: '#8b5cf6' }} />
                    특성 정보
                  </span>
                }
                className="mb-6"
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                <div className="flex flex-wrap gap-3">
                  {mob.category && (
                    <Tag 
                      color="blue" 
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      {mob.category}
                    </Tag>
                  )}
                  {mob.boss && (
                    <Tag 
                      color="red" 
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      보스 몬스터
                    </Tag>
                  )}
                  {mob.undead && (
                    <Tag 
                      color="purple" 
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      언데드
                    </Tag>
                  )}
                  {mob.publicReward && (
                    <Tag 
                      color="green" 
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      공용 보상
                    </Tag>
                  )}
                  {mob.explosive && (
                    <Tag 
                      color="volcano" 
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      폭발형
                    </Tag>
                  )}
                  {mob.firstAttack && (
                    <Tag 
                      color="orange" 
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: '20px', 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      선제공격
                    </Tag>
                  )}
                </div>
              </Card>
            )}

            {/* 애니메이션 정보 섹션 */}
            {mob.framebooks && Object.keys(mob.framebooks).length > 0 && (
              <Card 
                title={
                  <span>
                    <RocketOutlined className="mr-2" style={{ color: '#10b981' }} />
                    애니메이션 정보
                  </span>
                }
                className="mb-6"
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                <Row gutter={[12, 12]}>
                  {Object.entries(mob.framebooks).map(([key, value]) => {
                    const labels: { [k: string]: string } = {
                      'stand': '대기',
                      'move': '이동',
                      'hit1': '피격',
                      'die1': '사망'
                    };
                    
                    return (
                      <Col xs={12} sm={6} key={key}>
                        <div className="p-3 bg-green-50 rounded-lg text-center border border-green-200">
                          <div className="mb-1 text-green-600" style={{ fontSize: '14px' }}>
                            <RocketOutlined />
                          </div>
                          <div className="text-sm font-bold text-green-700">
                            {value} 프레임
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {labels[key] || key}
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </Card>
            )}

            {/* 출현 위치 섹션 */}
            {mob.foundAt && mob.foundAt.length > 0 && (
              <Card 
                title={
                  <span>
                    <EyeOutlined className="mr-2" style={{ color: '#f59e0b' }} />
                    출현 위치 ({mob.foundAt.length}개 맵)
                  </span>
                }
                className="mb-6"
                style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                <div className="flex flex-wrap gap-2">
                  {mob.foundAt.map((mapId, index) => (
                    <Tag 
                      key={index}
                      color="orange"
                      style={{ 
                        padding: '2px 6px', 
                        borderRadius: '8px',
                        fontSize: '10px',
                        fontWeight: '500'
                      }}
                    >
                      맵 {mapId}
                    </Tag>
                  ))}
                </div>
              </Card>
            )}

            {/* 설명 */}
            {mob.description && (
              <Card 
                title="몬스터 정보"
                className="mb-3"
                style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <Paragraph 
                  className="text-gray-700 leading-relaxed"
                  style={{ fontSize: '14px' }}
                >
                  {mob.description}
                </Paragraph>
              </Card>
            )}

            {/* 기타 추가 정보 (표시되지 않은 나머지 데이터) */}
            {(() => {
              // 이미 표시된 필드들
              const displayedFields = [
                'id', 'name', 'linksTo', 'foundAt', 'framebooks',
                'level', 'maxHP', 'exp', 'isBodyAttack',
                'physicalDamage', 'magicDamage', 'accuracy', 'speed', 'minimumPushDamage',
                'physicalDefenseRate', 'magicDefenseRate',
                'summonType', 'linksToOtherMob', 'revivesMonsterId',
                'category', 'publicReward', 'explosive', 'firstAttack', 'boss', 'undead',
                'description', 'skill', 'buff', 'revive', 'meta'
              ];
              
              const additionalStats = Object.keys(mob)
                .filter(key => {
                  const value = mob[key];
                  return (
                    !displayedFields.includes(key) &&
                    value !== null && 
                    value !== undefined && 
                    value !== '' &&
                    (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'string')
                  );
                });

              if (additionalStats.length === 0) return null;

              return (
                <Card 
                  title="기타 정보"
                  style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                >
                  <Row gutter={[12, 12]}>
                    {additionalStats.map(key => {
                      const value = mob[key];
                      let displayValue = value;
                      
                      if (typeof value === 'number' && Math.abs(value) > 1000) {
                        displayValue = value.toLocaleString();
                      } else if (typeof value === 'boolean') {
                        displayValue = value ? '예' : '아니오';
                      }

                      return (
                        <Col xs={12} sm={8} md={6} key={key}>
                          <div className="p-3 bg-gray-50 rounded-lg text-center">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {displayValue}
                            </div>
                            <div className="text-xs text-gray-500">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </Card>
              );
            })()}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <Text type="secondary" style={{ fontSize: '16px' }}>
            몬스터 정보를 불러올 수 없습니다.
          </Text>
        </div>
      )}
    </Modal>
  );
};