import React, { useState } from 'react';
import { MapleMob } from '@/types/maplestory';

interface MobMapleTooltipProps {
  mob: MapleMob;
  onClose?: () => void;
}

export const MobMapleTooltip: React.FC<MobMapleTooltipProps> = ({ mob, onClose }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getMobImage = (): string => {
    if (imageError) return '';
    return `https://maplestory.io/api/KMS/389/mob/${mob.id}/render/stand`;
  };

  // 몬스터 등급에 따른 이름 색상
  const getMobNameColor = () => {
    if (mob.boss) return 'stat-legendary';
    if (mob.level && mob.level >= 200) return 'stat-unique';
    if (mob.level && mob.level >= 100) return 'stat-epic';
    if (mob.level && mob.level >= 50) return 'stat-enhance';
    return 'stat-normal';
  };

  // 스탯 표시 헬퍼 (색상 구분)
  const renderStat = (label: string, value: any, unit?: string, statType?: string) => {
    if (value === undefined || value === null) return null;
    
    // 스탯 타입별 색상 클래스
    const getStatColorClass = (type?: string) => {
      switch (type) {
        case 'health': return 'stat-legendary'; // 체력 - 연두색
        case 'exp': return 'stat-enhance'; // 경험치 - 노란색  
        case 'attack': return 'stat-negative'; // 공격력 - 빨간색
        case 'defense': return 'stat-special'; // 방어력 - 파란색
        case 'accuracy': return 'stat-epic'; // 명중률 - 보라색
        case 'speed': return 'stat-unique'; // 속도 - 주황색
        default: return 'stat-normal'; // 기본 - 흰색
      }
    };
    
    return (
      <div className="maple-tooltip-stat">
        <span className="maple-tooltip-stat-label">{label} : </span>
        <span className={`maple-tooltip-stat-value ${getStatColorClass(statType)}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}{unit || ''}
        </span>
      </div>
    );
  };

  // 몬스터 타입 태그
  const getMobTypeTags = () => {
    const tags = [];
    if (mob.boss) tags.push({ label: '보스 몬스터', color: 'stat-legendary' });
    if (mob.isBodyAttack !== undefined) {
      tags.push({ 
        label: mob.isBodyAttack ? '근접공격' : '원거리공격', 
        color: mob.isBodyAttack ? 'stat-negative' : 'stat-special' 
      });
    }
    return tags;
  };

  return (
    <div className="maple-tooltip">
      {/* 헤더 - 몬스터 이름 */}
      <div className="maple-tooltip-name">
        <span className={`${getMobNameColor()}`}>{mob.name}</span>
        {onClose && (
          <button 
            className="maple-tooltip-close-btn"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        )}
      </div>

      {/* 메인 정보 박스 */}
      <div className="maple-tooltip-detail-box">
        {/* 몬스터 이미지 */}
        <div className="maple-tooltip-icon-section">
          {imageError ? (
            <div style={{ 
              fontSize: '48px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%' 
            }}>
              👾
            </div>
          ) : (
            <img
              src={getMobImage()}
              alt={mob.name}
              className="maple-tooltip-icon"
              onError={handleImageError}
            />
          )}
        </div>

        {/* 기본 정보 */}
        <div className="maple-tooltip-stats-section">
          {mob.level && (
            <div className="maple-tooltip-req stat-enhance">
              레벨 {mob.level}
            </div>
          )}
          
          <div className="maple-tooltip-req">
            몬스터 ID: {mob.id}
          </div>

          {mob.linksTo && (
            <div className="maple-tooltip-req">
              연결 ID: {mob.linksTo}
            </div>
          )}

          {/* 몬스터 타입 태그 */}
          {getMobTypeTags().map((tag, index) => (
            <div key={index} className={`maple-tooltip-req ${tag.color}`}>
              {tag.label}
            </div>
          ))}
        </div>
      </div>

      {/* 구분선 */}
      <div className="maple-tooltip-divider"></div>

      {/* 기본 정보 */}
      <div className="maple-tooltip-bottom-stats">
        {renderStat('체력', mob.maxHP, '', 'health')}
        {renderStat('경험치', mob.exp, '', 'exp')}
      </div>

      {/* 공격 능력치 */}
      {(mob.physicalDamage || mob.magicDamage || mob.accuracy || mob.minimumPushDamage) && (
        <>
          <div className="maple-tooltip-divider"></div>
          <div className="maple-tooltip-description">
            <div className="maple-tooltip-set-title">공격 능력치</div>
            <div style={{ marginTop: '8px' }}>
              {renderStat('물리공격력', mob.physicalDamage, '', 'attack')}
              {renderStat('마법공격력', mob.magicDamage, '', 'attack')}
              {renderStat('명중률', mob.accuracy, '', 'accuracy')}
              {renderStat('최소밀림데미지', mob.minimumPushDamage, '', 'attack')}
            </div>
          </div>
        </>
      )}

      {/* 방어 능력치 */}
      {(mob.physicalDefenseRate || mob.magicDefenseRate) && (
        <>
          <div className="maple-tooltip-divider"></div>
          <div className="maple-tooltip-description">
            <div className="maple-tooltip-set-title">방어 능력치</div>
            <div style={{ marginTop: '8px' }}>
              {renderStat('물리방어율', mob.physicalDefenseRate, '%', 'defense')}
              {renderStat('마법방어율', mob.magicDefenseRate, '%', 'defense')}
            </div>
          </div>
        </>
      )}

      {/* 기타 능력치 */}
      {mob.speed && (
        <>
          <div className="maple-tooltip-divider"></div>
          <div className="maple-tooltip-description">
            <div className="maple-tooltip-set-title">기타 능력치</div>
            <div style={{ marginTop: '8px' }}>
              {renderStat('이동속도', mob.speed, '', 'speed')}
            </div>
          </div>
        </>
      )}

      {/* 출현 위치 */}
      {mob.foundAt && mob.foundAt.length > 0 && (
        <>
          <div className="maple-tooltip-divider"></div>
          <div className="maple-tooltip-description">
            <div className="maple-tooltip-set-title">출현 위치</div>
            <div style={{ marginTop: '8px', fontSize: '12px' }}>
              {mob.foundAt.slice(0, 5).map((mapId, index) => (
                <span key={index} style={{ color: '#00ffff' }}>
                  맵 {mapId}{index < Math.min(4, mob.foundAt.length - 1) ? ', ' : ''}
                </span>
              ))}
              {mob.foundAt.length > 5 && (
                <span style={{ color: '#cccccc' }}>
                  {' '}외 {mob.foundAt.length - 5}개 맵
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};