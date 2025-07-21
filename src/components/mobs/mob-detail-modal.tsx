'use client';

import { Modal, Typography, Image, Spin, Tag } from 'antd';
import { MapleMob } from '@/types/maplestory';
import { useState, useEffect } from 'react';
import { mapleAPI } from '@/lib/api';
import { 
  TrophyOutlined, 
  FireOutlined, 
  HeartOutlined,
  StarOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  SafetyOutlined,
  RocketOutlined,
  BugOutlined,
  AimOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useTheme } from '@/components/providers/theme-provider';

const { Title, Text } = Typography;

interface MobDetailModalProps {
  mobId: number | null;
  open: boolean;
  onClose: () => void;
}

interface DetailedMob extends MapleMob {
  [key: string]: any;
}

export const MobDetailModal: React.FC<MobDetailModalProps> = ({ mobId, open, onClose }) => {
  const [mob, setMob] = useState<DetailedMob | null>(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    if (open && mobId) {
      loadMobDetails();
    }
  }, [open, mobId]);

  const loadMobDetails = async () => {
    if (!mobId) return;
    
    setLoading(true);
    try {
      const mobData = await mapleAPI.getMob(mobId);
      if (mobData) {
        const detailedMob: DetailedMob = {
          ...mobData,
          ...(mobData.meta || {}),
        };
        setMob(detailedMob);
      }
    } catch (error) {
      console.error('몬스터 상세 정보 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatIcon = (statKey: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'level': <TrophyOutlined />,
      'maxHP': <HeartOutlined />,
      'exp': <StarOutlined />,
      'physicalDamage': <BugOutlined />,
      'magicDamage': <FireOutlined />,
      'accuracy': <AimOutlined />,
      'speed': <ThunderboltOutlined />,
      'physicalDefenseRate': <SafetyOutlined />,
      'magicDefenseRate': <SafetyOutlined />,
      'minimumPushDamage': <RocketOutlined />,
      'summonType': <CrownOutlined />
    };
    return iconMap[statKey] || <StarOutlined />;
  };

  if (loading) {
    return (
      <Modal
        title={null}
        open={open}
        onCancel={onClose}
        footer={null}
        width="950px"
        centered
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      </Modal>
    );
  }

  if (!mob) {
    return (
      <Modal
        title={null}
        open={open}
        onCancel={onClose}
        footer={null}
        width="950px"
        centered
        styles={{ body: { padding: 0 } }}
      >
        <div className="text-center py-20">
          <Text type="secondary" className="text-lg">
            몬스터 정보를 불러올 수 없습니다.
          </Text>
        </div>
      </Modal>
    );
  }

  const primaryStats = [
    { key: 'level', label: '레벨', value: mob.level ? mob.level.toLocaleString() : null, color: '#faad14' },
    { key: 'maxHP', label: 'HP', value: mob.maxHP ? mob.maxHP.toLocaleString() : null, color: '#ef4444' },
    { key: 'exp', label: '경험치', value: mob.exp ? mob.exp.toLocaleString() : null, color: '#10b981' },
    { key: 'physicalDamage', label: '물리공격', value: mob.physicalDamage ? mob.physicalDamage.toLocaleString() : null, color: '#f59e0b' }
  ].filter(stat => stat.value !== null && stat.value !== undefined);

  const combatStats = [
    { key: 'magicDamage', label: '마법공격', value: mob.magicDamage ? mob.magicDamage.toLocaleString() : null, color: '#8b5cf6' },
    { key: 'accuracy', label: '명중률', value: mob.accuracy ? mob.accuracy.toLocaleString() : null, color: '#06b6d4' },
    { key: 'speed', label: '이동속도', value: mob.speed ? mob.speed.toLocaleString() : null, color: '#84cc16' },
    { key: 'minimumPushDamage', label: '최소밀림데미지', value: mob.minimumPushDamage ? mob.minimumPushDamage.toLocaleString() : null, color: '#f97316' }
  ].filter(stat => stat.value !== null && stat.value !== undefined);

  const defenseStats = [
    { key: 'physicalDefenseRate', label: '물리방어율', value: mob.physicalDefenseRate ? mob.physicalDefenseRate.toLocaleString() : null, color: '#6b7280', unit: '%' },
    { key: 'magicDefenseRate', label: '마법방어율', value: mob.magicDefenseRate ? mob.magicDefenseRate.toLocaleString() : null, color: '#6b7280', unit: '%' }
  ].filter(stat => stat.value !== null && stat.value !== undefined);


  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={null}
      width="950px"
      centered
      styles={{
        body: { 
          padding: 0,
          borderRadius: '20px',
          overflow: 'hidden',
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
    >
      <div 
        style={{
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
        }}
      >
        {/* 상단 헤더 - 이미지와 기본 정보 */}
        <div className="relative">
          <div 
            className="absolute inset-0"
            style={{
              background: theme === 'dark' 
                ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))'
                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1))',
              filter: 'blur(60px)'
            }}
          />
          
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              {/* 왼쪽 - 몬스터 이미지 */}
              <div className="flex-shrink-0">
                <div 
                  className="p-8 rounded-3xl"
                  style={{
                    background: theme === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(20px)',
                    border: theme === 'dark' 
                      ? '3px solid rgba(255, 255, 255, 0.3)' 
                      : '3px solid rgba(0, 0, 0, 0.2)',
                    boxShadow: theme === 'dark' 
                      ? '0 20px 40px rgba(0, 0, 0, 0.3)' 
                      : '0 20px 40px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Image
                    src={`https://maplestory.io/api/KMS/389/mob/${mob.id}/render/stand`}
                    alt={mob.name}
                    style={{ 
                      width: '280px',
                      height: '280px',
                      objectFit: 'contain'
                    }}
                    fallback="/placeholder-monster.png"
                    preview={false}
                  />
                </div>
              </div>

              {/* 오른쪽 - 기본 정보 */}
              <div className="flex-1 text-center lg:text-left">
                <Title 
                  level={1} 
                  style={{ 
                    margin: '0 0 16px 0',
                    fontSize: 'clamp(28px, 5vw, 36px)',
                    fontWeight: 800,
                    color: theme === 'dark' ? '#f8fafc' : '#1e293b',
                    textShadow: theme === 'dark' 
                      ? '0 4px 12px rgba(0, 0, 0, 0.5)' 
                      : '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {mob.name}
                </Title>

                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  {mob.level && (
                    <Tag 
                      icon={<TrophyOutlined />}
                      style={{
                        background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '25px',
                        padding: '8px 20px',
                        fontSize: '15px',
                        fontWeight: '700',
                        boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)'
                      }}
                    >
                      레벨 {mob.level}
                    </Tag>
                  )}
                  {mob.isBodyAttack !== undefined && (
                    <Tag 
                      icon={<FireOutlined />}
                      style={{
                        background: mob.isBodyAttack 
                          ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                          : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '25px',
                        padding: '8px 20px',
                        fontSize: '15px',
                        fontWeight: '700',
                        boxShadow: mob.isBodyAttack 
                          ? '0 6px 16px rgba(239, 68, 68, 0.4)'
                          : '0 6px 16px rgba(59, 130, 246, 0.4)'
                      }}
                    >
                      {mob.isBodyAttack ? '근접공격' : '원거리공격'}
                    </Tag>
                  )}
                  {mob.boss && (
                    <Tag 
                      icon={<CrownOutlined />}
                      style={{
                        background: 'linear-gradient(135deg, #dc2626, #991b1b)',
                        border: 'none',
                        color: 'white',
                        borderRadius: '25px',
                        padding: '8px 20px',
                        fontSize: '15px',
                        fontWeight: '700',
                        boxShadow: '0 6px 16px rgba(220, 38, 38, 0.4)'
                      }}
                    >
                      보스 몬스터
                    </Tag>
                  )}
                </div>

                {/* ID 정보 */}
                <div className="text-sm opacity-75 mb-4">
                  <Text style={{ color: theme === 'dark' ? '#94a3b8' : '#64748b' }}>
                    몬스터 ID: {mob.id}
                    {mob.linksTo && ` • 연결 ID: ${mob.linksTo}`}
                  </Text>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 - 상세 정보 */}
        <div 
          className="p-6"
          style={{
            background: theme === 'dark' ? '#0f172a' : '#ffffff'
          }}
        >
          {/* 주요 스탯 */}
          {primaryStats.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <TrophyOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                <Text 
                  className="text-lg font-bold"
                  style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}
                >
                  기본 능력치
                </Text>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {primaryStats.map((stat) => (
                  <div 
                    key={stat.key}
                    className="text-center p-4 rounded-2xl"
                    style={{
                      background: theme === 'dark' 
                        ? `${stat.color}15` 
                        : `${stat.color}08`,
                      border: `2px solid ${stat.color}30`,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div 
                      className="text-2xl mb-3"
                      style={{ color: stat.color }}
                    >
                      {getStatIcon(stat.key)}
                    </div>
                    <div 
                      className="text-xl font-bold mb-2"
                      style={{ 
                        color: theme === 'dark' ? '#f8fafc' : '#1e293b'
                      }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-sm font-medium"
                      style={{ 
                        color: theme === 'dark' ? '#94a3b8' : '#64748b'
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 전투 스탯 */}
          {combatStats.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BugOutlined style={{ color: '#ef4444', fontSize: '18px' }} />
                <Text 
                  className="text-lg font-bold"
                  style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}
                >
                  전투 능력치
                </Text>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {combatStats.map((stat) => (
                  <div 
                    key={stat.key}
                    className="text-center p-4 rounded-2xl"
                    style={{
                      background: theme === 'dark' 
                        ? `${stat.color}15` 
                        : `${stat.color}08`,
                      border: `2px solid ${stat.color}30`
                    }}
                  >
                    <div 
                      className="text-2xl mb-3"
                      style={{ color: stat.color }}
                    >
                      {getStatIcon(stat.key)}
                    </div>
                    <div 
                      className="text-xl font-bold mb-2"
                      style={{ 
                        color: theme === 'dark' ? '#f8fafc' : '#1e293b'
                      }}
                    >
                      {stat.value}
                    </div>
                    <div 
                      className="text-sm font-medium"
                      style={{ 
                        color: theme === 'dark' ? '#94a3b8' : '#64748b'
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 방어 스탯 */}
          {defenseStats.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <SafetyOutlined style={{ color: '#6b7280', fontSize: '18px' }} />
                <Text 
                  className="text-lg font-bold"
                  style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}
                >
                  방어 능력치
                </Text>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {defenseStats.map((stat) => (
                  <div 
                    key={stat.key}
                    className="text-center p-6 rounded-2xl"
                    style={{
                      background: theme === 'dark' 
                        ? `${stat.color}15` 
                        : `${stat.color}08`,
                      border: `2px solid ${stat.color}30`
                    }}
                  >
                    <div 
                      className="text-3xl mb-3"
                      style={{ color: stat.color }}
                    >
                      {getStatIcon(stat.key)}
                    </div>
                    <div 
                      className="text-2xl font-bold mb-2"
                      style={{ 
                        color: theme === 'dark' ? '#f8fafc' : '#1e293b'
                      }}
                    >
                      {stat.value}{stat.unit || ''}
                    </div>
                    <div 
                      className="text-sm font-medium"
                      style={{ 
                        color: theme === 'dark' ? '#94a3b8' : '#64748b'
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}


          {/* 출현 위치 */}
          {mob.foundAt && mob.foundAt.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <EyeOutlined style={{ color: '#f59e0b', fontSize: '18px' }} />
                <Text 
                  className="text-lg font-bold"
                  style={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}
                >
                  출현 위치 ({mob.foundAt.length}개 맵)
                </Text>
              </div>
              <div 
                className="p-6 rounded-2xl"
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(245, 158, 11, 0.15)' 
                    : 'rgba(245, 158, 11, 0.08)',
                  border: '2px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <div className="flex flex-wrap gap-2">
                  {mob.foundAt.slice(0, 30).map((mapId, index) => (
                    <Tag 
                      key={index}
                      style={{ 
                        background: theme === 'dark' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)',
                        border: '1px solid rgba(245, 158, 11, 0.5)',
                        color: theme === 'dark' ? '#fbbf24' : '#d97706',
                        borderRadius: '12px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      맵 {mapId}
                    </Tag>
                  ))}
                  {mob.foundAt.length > 30 && (
                    <Tag 
                      style={{ 
                        background: theme === 'dark' ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.2)',
                        border: '1px solid rgba(156, 163, 175, 0.5)',
                        color: theme === 'dark' ? '#9ca3af' : '#6b7280',
                        borderRadius: '12px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      +{mob.foundAt.length - 30}개 더
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};