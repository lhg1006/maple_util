import React, { useMemo } from 'react';
import { MapleItem } from '@/types/maplestory';

interface ItemMapleTooltipProps {
  item: MapleItem;
  stats?: any;
  onClose?: () => void;
}

export const ItemMapleTooltip: React.FC<ItemMapleTooltipProps> = ({ item, stats, onClose }) => {
  // 직업 코드를 직업명으로 변환
  const getJobName = (jobCode: number): string => {
    switch (jobCode) {
      case 0: return "ALL";
      case 1: return "전사";
      case 2: return "마법사";
      case 4: return "궁수";
      case 8: return "도적";
      case 24: return "도적";
      default: return jobCode.toString();
    }
  };

  // 메이플스토리 특수 마크업 처리
  const parseMapleDescription = (description: string): string => {
    if (!description) return description;

    let parsed = description;

    // #...# 일반 강조 마크업
    parsed = parsed.replace(/#([^#czBit]+)#/g, '<span style="color: #FFD700; font-weight: bold;">$1</span>');

    // #c...# 글씨 강조 (Color, Bold 등)
    parsed = parsed.replace(/#c([^#]*)#/g, '<span style="color: #FFD700; font-weight: bold;">$1</span>');

    // #B...# 더 큰 강조 (보통 퀘스트나 이벤트용)
    parsed = parsed.replace(/#B([^#]*)#/g, '<span style="color: #FF6B35; font-weight: bold; font-size: 1.1em;">$1</span>');

    // #z아이템ID# 해당 아이템의 이름 자동 삽입 (임시로 링크 스타일)
    parsed = parsed.replace(/#z(\d+)#/g, '<span style="color: #66CCFF; text-decoration: underline;" title="아이템 ID: $1">[아이템 $1]</span>');

    // #i아이템ID# 해당 아이템의 아이콘 표시 (임시로 아이콘 이모지)
    parsed = parsed.replace(/#i(\d+)#/g, '<span style="color: #00FF66; font-weight: bold;" title="아이템 아이콘 ID: $1">🎯</span>');

    // #t아이템ID# 해당 아이템의 툴팁 표시 (임시로 링크 스타일)
    parsed = parsed.replace(/#t(\d+)#/g, '<span style="color: #FF66FF; text-decoration: underline;" title="아이템 툴팁 ID: $1">[툴팁 $1]</span>');

    return parsed;
  };

  // 디버깅 로그
  console.log('🎯 ItemMapleTooltip 렌더링:', {
    item: item.name,
    hasRequirements: !!item.requirements,
    hasCombat: !!item.combat,
    hasStats: !!item.stats,
    statsFromAPI: !!stats,
    requirements: item.requirements,
    combat: item.combat,
    statsData: item.stats,
    apiStats: stats
  });

  // 아이템 등급에 따른 이름 색상
  const getItemNameColor = () => {
    if (item.cash) return 'stat-special';
    if ((item as any)._hasValidStats) {
      if (item.level && item.level >= 150) return 'stat-legendary';
      if (item.level && item.level >= 100) return 'stat-unique';
      if (item.level && item.level >= 70) return 'stat-epic';
    }
    return 'stat-normal';
  };

  // 스탯 표시 헬퍼
  const renderStat = (label: string, value: any, type: 'normal' | 'bonus' | 'enhance' = 'normal') => {
    if (value === undefined || value === null) return null;
    
    // 아이템 스탯은 0이면 표시하지 않음
    if (value === 0) {
      return null;
    }
    
    return (
      <div className="maple-tooltip-stat">
        <span className="maple-tooltip-stat-label">{label} : </span>
        <span className={`maple-tooltip-stat-value stat-${type}`}>
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
    );
  };

  // 요구사항 체크 (0보다 큰 값이 있거나 장비 아이템이면 표시)
  const hasRequirements = item.requirements && (
    item.requirements.level > 0 ||
    item.requirements.str > 0 ||
    item.requirements.dex > 0 ||
    item.requirements.int > 0 ||
    item.requirements.luk > 0 ||
    (item.category && ['Accessory', 'Armor', 'One-Handed Weapon', 'Two-Handed Weapon', 'Secondary Weapon'].includes(item.category))
  );

  // 하단 스탯 영역에 실제 표시될 내용이 있는지 미리 계산
  const hasBottomStats = useMemo(() => {
    // renderStat 함수와 동일한 로직으로 실제 표시될 스탯 확인
    const checkStat = (value: any) => value !== undefined && value !== null && value !== 0;
    
    // 공격력/마력
    const hasAttack = checkStat(item.combat?.attack || stats?.combat?.attack);
    const hasMagicAttack = checkStat(item.combat?.magicAttack || stats?.combat?.magicAttack);
    
    // 주스텟
    const hasStr = checkStat(item.stats?.str || stats?.stats?.str);
    const hasDex = checkStat(item.stats?.dex || stats?.stats?.dex);
    const hasInt = checkStat(item.stats?.int || stats?.stats?.int);
    const hasLuk = checkStat(item.stats?.luk || stats?.stats?.luk);
    
    // 나머지 스탯
    const hasDefense = checkStat(item.combat?.defense || stats?.combat?.defense);
    const hasMagicDefense = checkStat(item.combat?.magicDefense || stats?.combat?.magicDefense);
    const hasAccuracy = checkStat(item.combat?.accuracy || stats?.combat?.accuracy);
    const hasAvoidability = checkStat(item.combat?.avoidability || stats?.combat?.avoidability);
    const hasSpeed = checkStat(item.combat?.speed || stats?.combat?.speed);
    const hasJump = checkStat(item.combat?.jump || stats?.combat?.jump);
    
    // 업그레이드
    const hasUpgrade = item.enhancement?.upgradeSlots > 0;
    
    return hasAttack || hasMagicAttack || hasStr || hasDex || hasInt || hasLuk || 
           hasDefense || hasMagicDefense || hasAccuracy || hasAvoidability || hasSpeed || hasJump || hasUpgrade;
  }, [item, stats]);

  return (
    <div className="maple-tooltip">
      {/* 아이템 이름 (상단) */}
      <div className={`maple-tooltip-name ${getItemNameColor()}`}>
        {item.name}
        {onClose && (
          <button 
            onClick={onClose}
            className="maple-tooltip-close-btn"
            aria-label="닫기"
          >
            ✕
          </button>
        )}
      </div>

      {/* 아이템 상세 정보 박스 */}
      <div className="maple-tooltip-detail-box">
        {/* 좌측: 아이템 아이콘 */}
        <div className="maple-tooltip-icon-section">
          <img 
            src={item.icon} 
            alt={item.name}
            className="maple-tooltip-icon"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-item.png';
            }}
          />
        </div>

        {/* 우측: 스탯 정보 */}
        <div className="maple-tooltip-stats-section">
          {/* 요구 레벨 - 0이어도 표시 */}
          {item.requirements?.level !== undefined && (
            <div className="maple-tooltip-req">REQ LEV : {item.requirements.level}</div>
          )}
          {item.requirements?.str !== undefined && (
            <div className="maple-tooltip-req">REQ STR : {item.requirements.str}</div>
          )}
          {item.requirements?.dex !== undefined && (
            <div className="maple-tooltip-req">REQ DEX : {item.requirements.dex}</div>
          )}
          {item.requirements?.int !== undefined && (
            <div className="maple-tooltip-req">REQ INT : {item.requirements.int}</div>
          )}
          {item.requirements?.luk !== undefined && (
            <div className="maple-tooltip-req">REQ LUK : {item.requirements.luk}</div>
          )}
          {item.requirements?.job !== undefined && (
            <div className="maple-tooltip-req">REQ JOB : {getJobName(item.requirements.job)}</div>
          )}
        </div>
      </div>

      {/* 하단 스탯 영역 - 실제 렌더링될 내용이 있을 때만 표시 */}
      {hasBottomStats && (
        <>
          {/* 구분선 */}
          <div className="maple-tooltip-divider"></div>
          
          <div className="maple-tooltip-bottom-stats">
            {/* 1. 공격력/마력 */}
            {!!(item.combat || stats?.combat) && (
              <>
                {renderStat('공격력', item.combat?.attack || stats?.combat?.attack, 'enhance')}
                {renderStat('마력', item.combat?.magicAttack || stats?.combat?.magicAttack, 'enhance')}
              </>
            )}
            
            {/* 2. 주스텟 (STR, DEX, INT, LUK) */}
            {!!(item.stats || stats?.stats) && (
              <>
                {renderStat('STR', item.stats?.str || stats?.stats?.str, 'bonus')}
                {renderStat('DEX', item.stats?.dex || stats?.stats?.dex, 'bonus')}
                {renderStat('INT', item.stats?.int || stats?.stats?.int, 'bonus')}
                {renderStat('LUK', item.stats?.luk || stats?.stats?.luk, 'bonus')}
              </>
            )}
            
            {/* 3. 나머지 스탯 */}
            {!!(item.combat || stats?.combat) && (
              <>
                {renderStat('물리방어력', item.combat?.defense || stats?.combat?.defense)}
                {renderStat('마법방어력', item.combat?.magicDefense || stats?.combat?.magicDefense)}
                {renderStat('명중률', item.combat?.accuracy || stats?.combat?.accuracy)}
                {renderStat('회피율', item.combat?.avoidability || stats?.combat?.avoidability)}
                {renderStat('이동속도', item.combat?.speed || stats?.combat?.speed)}
                {renderStat('점프력', item.combat?.jump || stats?.combat?.jump)}
              </>
            )}
            
            {/* 4. 업그레이드 가능 횟수 */}
            {item.enhancement?.upgradeSlots > 0 && (
              <div className="maple-tooltip-upgrade">
                업그레이드 가능 횟수 : {item.enhancement.upgradeSlots}
                {(item.enhancement as any)?.hammerApplied && (
                  <div style={{ color: '#00ff00', fontSize: '10px', marginTop: '2px' }}>
                    황금망치 제련 적용
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* 설명 */}
      {!!item.description && (
        <div 
          className="maple-tooltip-description"
          dangerouslySetInnerHTML={{
            __html: parseMapleDescription(item.description)
          }}
        />
      )}

      {/* 세트 효과 */}
      {!!(item as any).setInfo && (
        <div className="maple-tooltip-set">
          <div className="maple-tooltip-set-title">
            {(item as any).setInfo.name || (item as any).setInfo.setName}
          </div>
          {!!(item as any).setInfo.items && (
            <div style={{ fontSize: '10px', marginTop: '2px' }}>
              ({(item as any).setInfo.items.length}세트)
            </div>
          )}
        </div>
      )}

      {/* 판매 가격 */}
      {item.price > 0 && (
        <div className="maple-tooltip-price">
          판매가격 : {item.price.toLocaleString()} 메소
        </div>
      )}
    </div>
  );
};