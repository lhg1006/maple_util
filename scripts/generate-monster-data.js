const fs = require('fs');
const path = require('path');

// maplestory.io API 설정
const API_BASE_URL = 'https://maplestory.io/api/KMS/284';
const REGION = 'KMS';
const VERSION = '284';

// 요청 간격 (API 제한 고려)
const REQUEST_DELAY = 100; // 100ms 간격
const BATCH_SIZE = 50; // 한 번에 처리할 몬스터 수

// 몬스터 ID 범위 (일반적인 MapleStory 몬스터 ID 범위)
const MONSTER_ID_RANGES = [
  { start: 100100, end: 100199 },    // 초보자 몬스터
  { start: 100200, end: 100299 },    // 초보자 몬스터 2
  { start: 1210100, end: 1210199 },  // 빅토리아 몬스터
  { start: 2100100, end: 2100199 },  // 빅토리아 몬스터 2
  { start: 2110100, end: 2110199 },  // 빅토리아 몬스터 3
  { start: 3210100, end: 3210199 },  // 엘나스 몬스터
  { start: 4130100, end: 4130199 },  // 루디브리엄 몬스터
  { start: 5120100, end: 5120199 },  // 미나르 숲 몬스터
  { start: 6130100, end: 6130199 },  // 아쿠아리움 몬스터
  { start: 7130100, end: 7130199 },  // 지구방위본부 몬스터
  { start: 8140100, end: 8140199 },  // 시간신전 몬스터
  { start: 9300000, end: 9300099 },  // 보스 몬스터
  { start: 9400000, end: 9400099 },  // 보스 몬스터 2
  { start: 9500000, end: 9500099 },  // 보스 몬스터 3
  { start: 8850000, end: 8850099 },  // 아케인 몬스터
  { start: 8870000, end: 8870099 },  // 아케인 몬스터 2
];

// 딜레이 함수
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API 요청 함수 (재시도 로직 포함)
async function fetchWithRetry(url, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 10000 // 10초 타임아웃
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        // 404는 정상적인 응답 (몬스터가 존재하지 않음)
        return null;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.warn(`⚠️ 재시도 ${i + 1}/${maxRetries} - ${url}: ${error.message}`);
      if (i === maxRetries - 1) throw error;
      await delay(1000 * (i + 1)); // 재시도 시 점진적 지연
    }
  }
}

// 몬스터 데이터 가져오기
async function fetchMonsterData(mobId) {
  const url = `${API_BASE_URL}/mob/${mobId}`;
  
  try {
    const data = await fetchWithRetry(url);
    if (!data) return null;
    
    // 데이터 정리 및 변환
    const cleanedData = {
      id: data.id,
      name: data.name,
      level: data.meta?.level || 0,
      hp: data.meta?.maxHP || 0,
      mp: data.meta?.maxMP || 0,
      exp: data.meta?.exp || 0,
      description: data.description || '',
      
      // 전투 관련 정보
      physicalDamage: data.meta?.physicalDamage || 0,
      magicDamage: data.meta?.magicDamage || 0,
      physicalDefense: data.meta?.physicalDefense || 0,
      magicDefense: data.meta?.magicDefense || 0,
      accuracy: data.meta?.accuracy || 0,
      evasion: data.meta?.evasion || 0,
      speed: data.meta?.speed || 0,
      
      // 특성 정보
      isBodyAttack: data.meta?.isBodyAttack || false,
      isUndead: data.meta?.isUndead || false,
      isBoss: data.meta?.isBoss || false,
      isAutoAggro: data.meta?.isAutoAggro || false,
      
      // 방어율 정보
      physicalDefenseRate: data.meta?.physicalDefenseRate || 0,
      magicDefenseRate: data.meta?.magicDefenseRate || 0,
      
      // 기타 정보
      minimumPushDamage: data.meta?.minimumPushDamage || 0,
      summonType: data.meta?.summonType || 0,
      hpRecovery: data.meta?.hpRecovery || 0,
      mpRecovery: data.meta?.mpRecovery || 0,
      
      // 색상 정보
      hpTagColor: data.meta?.hpTagColor || 0,
      hpTagBackgroundColor: data.meta?.hpTagBackgroundColor || 0,
      
      // 위치 정보
      foundAt: data.foundAt || [],
      
      // 원본 메타데이터 (필요시 접근)
      _originalMeta: data.meta || {}
    };
    
    return cleanedData;
  } catch (error) {
    console.error(`❌ 몬스터 ${mobId} 데이터 가져오기 실패:`, error.message);
    return null;
  }
}

// 배치 처리 함수
async function processBatch(mobIds, batchNumber, totalBatches) {
  console.log(`🔄 배치 ${batchNumber}/${totalBatches} 처리 중... (${mobIds.length}개 몬스터)`);
  
  const results = {};
  let successCount = 0;
  let errorCount = 0;
  
  for (const mobId of mobIds) {
    try {
      const data = await fetchMonsterData(mobId);
      if (data) {
        results[mobId] = data;
        successCount++;
        console.log(`✅ ${mobId}: ${data.name} (Lv.${data.level})`);
      }
    } catch (error) {
      errorCount++;
      console.error(`❌ ${mobId}: ${error.message}`);
    }
    
    await delay(REQUEST_DELAY);
  }
  
  console.log(`📊 배치 ${batchNumber} 완료: 성공 ${successCount}, 실패 ${errorCount}`);
  return results;
}

// 메인 함수
async function generateMonsterData() {
  console.log('🚀 몬스터 데이터 생성 시작...');
  console.log(`📋 설정: API=${API_BASE_URL}, 딜레이=${REQUEST_DELAY}ms, 배치크기=${BATCH_SIZE}`);
  
  // 모든 몬스터 ID 생성
  const allMobIds = [];
  MONSTER_ID_RANGES.forEach(range => {
    for (let id = range.start; id <= range.end; id++) {
      allMobIds.push(id);
    }
  });
  
  console.log(`📝 총 ${allMobIds.length}개 몬스터 ID 생성 (${MONSTER_ID_RANGES.length}개 범위)`);
  
  // 배치별로 처리
  const allResults = {};
  const batches = [];
  
  for (let i = 0; i < allMobIds.length; i += BATCH_SIZE) {
    batches.push(allMobIds.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`🔢 ${batches.length}개 배치로 분할`);
  
  for (let i = 0; i < batches.length; i++) {
    const batchResults = await processBatch(batches[i], i + 1, batches.length);
    Object.assign(allResults, batchResults);
    
    // 배치 간 휴식 (API 제한 고려)
    if (i < batches.length - 1) {
      console.log('⏱️ 배치 간 휴식 (2초)...');
      await delay(2000);
    }
  }
  
  // 결과 저장
  const outputPath = path.join(__dirname, '..', 'public', 'monsters-new.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf8');
  
  console.log(`✅ 완료! ${Object.keys(allResults).length}개 몬스터 데이터 저장`);
  console.log(`📁 파일 위치: ${outputPath}`);
  
  // 통계 출력
  const monsters = Object.values(allResults);
  const bosses = monsters.filter(m => m.isBoss);
  const levelStats = monsters.reduce((acc, m) => {
    const level = m.level;
    if (level <= 10) acc.beginner++;
    else if (level <= 50) acc.intermediate++;
    else if (level <= 100) acc.advanced++;
    else if (level <= 200) acc.expert++;
    else acc.boss++;
    return acc;
  }, { beginner: 0, intermediate: 0, advanced: 0, expert: 0, boss: 0 });
  
  console.log('\n📊 수집 결과 통계:');
  console.log(`   총 몬스터: ${monsters.length}개`);
  console.log(`   보스 몬스터: ${bosses.length}개`);
  console.log(`   레벨 분포:`);
  console.log(`     1-10: ${levelStats.beginner}개`);
  console.log(`     11-50: ${levelStats.intermediate}개`);
  console.log(`     51-100: ${levelStats.advanced}개`);
  console.log(`     101-200: ${levelStats.expert}개`);
  console.log(`     200+: ${levelStats.boss}개`);
  
  return allResults;
}

// 스크립트 실행
if (require.main === module) {
  generateMonsterData().catch(console.error);
}

module.exports = { generateMonsterData };