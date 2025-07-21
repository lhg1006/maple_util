import React, { useState } from 'react';

interface NPCData {
  id: number;
  name: string;
  location?: string;
  description?: string;
  scripts?: string[];
  [key: string]: any;
}

interface NPCMapleTooltipProps {
  npc: NPCData;
  onClose?: () => void;
}

export const NPCMapleTooltip: React.FC<NPCMapleTooltipProps> = ({ npc, onClose }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getNPCImage = (): string => {
    if (imageError) return '';
    return `https://maplestory.io/api/KMS/389/npc/${npc.id}/render/stand`;
  };

  // NPC 타입에 따른 이름 색상
  const getNPCNameColor = () => {
    if (npc.scripts && npc.scripts.length > 0) return 'stat-special'; // 대화 가능 - 파란색
    if (npc.location) return 'stat-enhance'; // 특정 위치 - 노란색
    return 'stat-normal'; // 기본 - 흰색
  };

  // 메이플스토리 특수 마크업 처리 (몬스터와 동일한 함수)
  const parseMapleDescription = (description: string): string => {
    if (!description) return description;

    let parsed = description;

    // 줄바꿈 처리
    parsed = parsed.replace(/\\r\\n/g, '<br>');
    parsed = parsed.replace(/\\n/g, '<br>');
    parsed = parsed.replace(/\r\n/g, '<br>');
    parsed = parsed.replace(/\n/g, '<br>');

    // #...# 일반 강조 마크업
    parsed = parsed.replace(/#([^#czBit]+)#/g, '<span style="color: #FFD700; font-weight: bold;">$1</span>');

    // #c...# 글씨 강조
    parsed = parsed.replace(/#c([^#]*)#/g, '<span style="color: #FFD700; font-weight: bold;">$1</span>');

    // #B...# 더 큰 강조
    parsed = parsed.replace(/#B([^#]*)#/g, '<span style="color: #FF6B35; font-weight: bold; font-size: 1.1em;">$1</span>');

    return parsed;
  };

  return (
    <div className="maple-tooltip">
      {/* 헤더 - NPC 이름 */}
      <div className="maple-tooltip-name">
        <span className={`${getNPCNameColor()}`}>{npc.name}</span>
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
        {/* NPC 이미지 */}
        <div className="maple-tooltip-icon-section">
          {imageError ? (
            <div style={{ 
              fontSize: '48px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%' 
            }}>
              👤
            </div>
          ) : (
            <img
              src={getNPCImage()}
              alt={npc.name}
              className="maple-tooltip-icon"
              onError={handleImageError}
            />
          )}
        </div>

        {/* 기본 정보 */}
        <div className="maple-tooltip-stats-section">
          <div className="maple-tooltip-req">
            NPC ID: {npc.id}
          </div>

          {npc.location && (
            <div className="maple-tooltip-req stat-enhance">
              위치: {npc.location}
            </div>
          )}

          {/* NPC 타입 표시 */}
          {npc.scripts && npc.scripts.length > 0 && (
            <div className="maple-tooltip-req stat-special">
              대화 가능
            </div>
          )}
        </div>
      </div>

      {/* NPC 설명 */}
      {npc.description && (
        <>
          <div className="maple-tooltip-divider"></div>
          <div className="maple-tooltip-description">
            <div 
              dangerouslySetInnerHTML={{ 
                __html: parseMapleDescription(npc.description) 
              }} 
            />
          </div>
        </>
      )}

      {/* 대화 스크립트 */}
      {npc.scripts && npc.scripts.length > 0 && (
        <>
          <div className="maple-tooltip-divider"></div>
          <div className="maple-tooltip-set">
            <div className="maple-tooltip-set-title">대화 내용</div>
            <div style={{ marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
              {npc.scripts.slice(0, 3).map((script, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <div style={{ color: '#ffff00', fontSize: '12px', marginBottom: '2px' }}>
                    대화 {index + 1}
                  </div>
                  <div 
                    style={{ color: '#cccccc', fontSize: '13px' }}
                    dangerouslySetInnerHTML={{ 
                      __html: parseMapleDescription(script) 
                    }} 
                  />
                </div>
              ))}
              {npc.scripts.length > 3 && (
                <div style={{ color: '#999999', fontSize: '12px', textAlign: 'center' }}>
                  +{npc.scripts.length - 3}개 대화 더 있음
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* API 정보 */}
      <div className="maple-tooltip-price">
        maplestory.io API 제공
      </div>
    </div>
  );
};