const fs = require('fs');
const path = require('path');

// maplestory.io API 설정
const API_BASE_URL = 'https://maplestory.io/api/KMS/284';
const REQUEST_DELAY = 50; // 더 빠른 요청 간격
const BATCH_SIZE = 20; // 더 작은 배치 크기
const CONCURRENT_REQUESTS = 5; // 동시 요청 수

// 주요 몬스터 ID만 선별 (테스트 및 주요 몬스터)
const IMPORTANT_MONSTER_IDS = [
  // 초보자 몬스터
  100100, 100101, 100120, 100121, 100122, 100123, 100124, 100130, 100131, 100132, 100133, 100134,
  100200, // 불가사리
  
  // 빅토리아 아일랜드 몬스터
  1210100, 1210101, 1210102, 1210103, 1210104, 1210111, // 돼지, 주황버섯, 버블링
  2100100, 2100101, 2100102, 2100103, 2100104, 2100105, // 하얀 모래토끼, 모래토끼
  
  // 주요 보스 몬스터
  9300028, 9300029, 9300030, 9300031, 9300032, 9300033, 9300034, 9300035, 9300036, 9300037,
  9400000, 9400001, 9400002, 9400003, 9400004, 9400005, 9400006, 9400007, 9400008, 9400009,
  9500000, 9500001, 9500002, 9500003, 9500004, 9500005,
  
  // 아케인 몬스터
  8850000, 8850001, 8850002, 8850003, 8850004, 8850005,
  8870000, 8870001, 8870002, 8870003, 8870004, 8870005,
  
  // 기타 중요 몬스터
  3210100, 3210101, 3210102, 3210103, 3210104, 3210105, // 엘나스
  4130100, 4130101, 4130102, 4130103, 4130104, 4130105, // 루디브리엄
  5120100, 5120101, 5120102, 5120103, 5120104, 5120105, // 미나르 숲
  6130100, 6130101, 6130102, 6130103, 6130104, 6130105, // 아쿠아리움
  7130100, 7130101, 7130102, 7130103, 7130104, 7130105, // 지구방위본부
  8140100, 8140101, 8140102, 8140103, 8140104, 8140105, // 시간신전
];

// 딜레이 함수
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API 요청 함수 (더 빠른 재시도)
async function fetchWithRetry(url, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 8000 // 8초 타임아웃
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
        return null;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await delay(500); // 짧은 재시도 지연
    }
  }
}

// 몬스터 데이터 가져오기 (간소화된 버전)
async function fetchMonsterData(mobId) {
  const url = `${API_BASE_URL}/mob/${mobId}`;
  
  try {
    const data = await fetchWithRetry(url);
    if (!data) return null;
    
    // 핵심 데이터만 추출
    const cleanedData = {
      id: data.id,
      name: data.name,
      level: data.meta?.level || 0,
      hp: data.meta?.maxHP || 0,
      mp: data.meta?.maxMP || 0,
      exp: data.meta?.exp || 0,
      description: data.description || '',
      
      // 전투 핵심 정보
      pad: data.meta?.physicalDamage || 0,
      mad: data.meta?.magicDamage || 0,
      pdr: data.meta?.physicalDefenseRate || 0,
      mdr: data.meta?.magicDefenseRate || 0,
      acc: data.meta?.accuracy || 0,
      eva: data.meta?.evasion || 0,
      speed: data.meta?.speed || 0,
      
      // 특성
      bodyAttack: data.meta?.isBodyAttack || false,
      undead: data.meta?.isUndead || false,
      boss: data.meta?.isBoss || false,
      
      // 위치 정보
      foundAt: data.foundAt || [],
    };
    
    return cleanedData;
  } catch (error) {
    console.error(`❌ ${mobId}: ${error.message}`);
    return null;
  }
}

// 병렬 처리 함수
async function processParallel(mobIds, concurrency = CONCURRENT_REQUESTS) {
  const results = {};
  const chunks = [];
  
  // 청크로 나누기
  for (let i = 0; i < mobIds.length; i += concurrency) {
    chunks.push(mobIds.slice(i, i + concurrency));
  }
  
  console.log(`🔄 ${chunks.length}개 청크로 병렬 처리 (동시 요청: ${concurrency})`);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`📦 청크 ${i + 1}/${chunks.length} 처리 중... (${chunk.length}개)`);
    
    // 병렬 요청
    const promises = chunk.map(mobId => fetchMonsterData(mobId));
    const chunkResults = await Promise.all(promises);
    
    // 결과 저장
    chunk.forEach((mobId, index) => {
      if (chunkResults[index]) {
        results[mobId] = chunkResults[index];
        console.log(`✅ ${mobId}: ${chunkResults[index].name} (Lv.${chunkResults[index].level})`);
      }
    });
    
    // 청크 간 짧은 휴식
    if (i < chunks.length - 1) {
      await delay(200);
    }
  }
  
  return results;
}

// 메인 함수
async function generateMonsterDataFast() {
  console.log('🚀 몬스터 데이터 빠른 생성 시작...');
  console.log(`📋 설정: ${IMPORTANT_MONSTER_IDS.length}개 주요 몬스터, 동시 요청: ${CONCURRENT_REQUESTS}`);
  
  const startTime = Date.now();
  
  // 병렬 처리로 데이터 수집
  const results = await processParallel(IMPORTANT_MONSTER_IDS, CONCURRENT_REQUESTS);
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  // 결과 저장
  const outputPath = path.join(__dirname, '..', 'public', 'monsters-new.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  
  console.log(`✅ 완료! ${Object.keys(results).length}개 몬스터 데이터 저장 (${duration}초)`);
  console.log(`📁 파일 위치: ${outputPath}`);
  
  // 통계 출력
  const monsters = Object.values(results);
  const bosses = monsters.filter(m => m.boss);
  const avgLevel = monsters.reduce((sum, m) => sum + m.level, 0) / monsters.length;
  
  console.log('\n📊 수집 결과:');
  console.log(`   총 몬스터: ${monsters.length}개`);
  console.log(`   보스 몬스터: ${bosses.length}개`);
  console.log(`   평균 레벨: ${avgLevel.toFixed(1)}`);
  console.log(`   최고 레벨: ${Math.max(...monsters.map(m => m.level))}`);
  console.log(`   최저 레벨: ${Math.min(...monsters.map(m => m.level))}`);
  
  return results;
}

// 스크립트 실행
if (require.main === module) {
  generateMonsterDataFast().catch(console.error);
}

module.exports = { generateMonsterDataFast };