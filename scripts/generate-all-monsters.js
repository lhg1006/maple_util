const fs = require('fs');
const path = require('path');

// maplestory.io API 설정
const API_BASE_URL = 'https://maplestory.io/api/KMS/284';
const CONCURRENT_REQUESTS = 10; // 더 많은 동시 요청

// 확장된 몬스터 ID 범위 (더 많은 몬스터 포함)
const EXTENDED_MONSTER_RANGES = [
  // 메이플 아일랜드 & 초보자
  { start: 100100, end: 100199, name: "메이플 아일랜드" },
  { start: 100200, end: 100299, name: "초보자 몬스터" },
  
  // 빅토리아 아일랜드
  { start: 1210100, end: 1210199, name: "빅토리아 1" },
  { start: 1220100, end: 1220199, name: "빅토리아 2" },
  { start: 1230100, end: 1230199, name: "빅토리아 3" },
  { start: 2100100, end: 2100199, name: "빅토리아 4" },
  { start: 2110100, end: 2110199, name: "빅토리아 5" },
  { start: 2120100, end: 2120199, name: "빅토리아 6" },
  { start: 2130100, end: 2130199, name: "빅토리아 7" },
  
  // 엘나스 & 루디브리엄
  { start: 3210100, end: 3210199, name: "엘나스 1" },
  { start: 3220100, end: 3220199, name: "엘나스 2" },
  { start: 3230100, end: 3230199, name: "엘나스 3" },
  { start: 4130100, end: 4130199, name: "루디브리엄 1" },
  { start: 4140100, end: 4140199, name: "루디브리엄 2" },
  { start: 4150100, end: 4150199, name: "루디브리엄 3" },
  
  // 미나르 숲 & 기타
  { start: 5120100, end: 5120199, name: "미나르 숲 1" },
  { start: 5130100, end: 5130199, name: "미나르 숲 2" },
  { start: 5140100, end: 5140199, name: "미나르 숲 3" },
  { start: 6130100, end: 6130199, name: "아쿠아리움 1" },
  { start: 6140100, end: 6140199, name: "아쿠아리움 2" },
  { start: 6150100, end: 6150199, name: "아쿠아리움 3" },
  
  // 지구방위본부 & 시간신전
  { start: 7130100, end: 7130199, name: "지구방위본부 1" },
  { start: 7140100, end: 7140199, name: "지구방위본부 2" },
  { start: 8140100, end: 8140199, name: "시간신전 1" },
  { start: 8150100, end: 8150199, name: "시간신전 2" },
  { start: 8160100, end: 8160199, name: "시간신전 3" },
  
  // 아케인 & 고레벨 몬스터
  { start: 8850000, end: 8850199, name: "아케인 1" },
  { start: 8860000, end: 8860199, name: "아케인 2" },
  { start: 8870000, end: 8870199, name: "아케인 3" },
  { start: 8880000, end: 8880199, name: "아케인 4" },
  { start: 8890000, end: 8890199, name: "아케인 5" },
  
  // 보스 몬스터 (확장)
  { start: 9300000, end: 9300199, name: "보스 1" },
  { start: 9400000, end: 9400199, name: "보스 2" },
  { start: 9500000, end: 9500199, name: "보스 3" },
  { start: 9600000, end: 9600199, name: "보스 4" },
  { start: 9700000, end: 9700199, name: "보스 5" },
  { start: 9800000, end: 9800199, name: "보스 6" },
  { start: 9900000, end: 9900199, name: "보스 7" },
  
  // 리부트 & 이벤트 몬스터
  { start: 8610000, end: 8610099, name: "리부트 1" },
  { start: 8620000, end: 8620099, name: "리부트 2" },
  { start: 8630000, end: 8630099, name: "리부트 3" },
  
  // 추가 지역 몬스터
  { start: 8510000, end: 8510099, name: "추가 지역 1" },
  { start: 8520000, end: 8520099, name: "추가 지역 2" },
  { start: 8530000, end: 8530099, name: "추가 지역 3" },
  { start: 8540000, end: 8540099, name: "추가 지역 4" },
  { start: 8550000, end: 8550099, name: "추가 지역 5" },
];

// 딜레이 함수
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// API 요청 함수
async function fetchWithRetry(url, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
        timeout: 8000
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
      await delay(300);
    }
  }
}

// 몬스터 데이터 가져오기
async function fetchMonsterData(mobId) {
  const url = `${API_BASE_URL}/mob/${mobId}`;
  
  try {
    const data = await fetchWithRetry(url);
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      level: data.meta?.level || 0,
      hp: data.meta?.maxHP || 0,
      mp: data.meta?.maxMP || 0,
      exp: data.meta?.exp || 0,
      description: data.description || '',
      
      // 전투 정보
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
      
      // 위치
      foundAt: data.foundAt || [],
    };
  } catch (error) {
    return null;
  }
}

// 범위별 처리 함수
async function processRange(range, concurrency = CONCURRENT_REQUESTS) {
  const mobIds = [];
  for (let id = range.start; id <= range.end; id++) {
    mobIds.push(id);
  }
  
  console.log(`🔄 ${range.name} 처리 중... (${mobIds.length}개, ${range.start}-${range.end})`);
  
  const results = {};
  const chunks = [];
  
  for (let i = 0; i < mobIds.length; i += concurrency) {
    chunks.push(mobIds.slice(i, i + concurrency));
  }
  
  let successCount = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const promises = chunk.map(mobId => fetchMonsterData(mobId));
    const chunkResults = await Promise.all(promises);
    
    chunk.forEach((mobId, index) => {
      if (chunkResults[index]) {
        results[mobId] = chunkResults[index];
        successCount++;
      }
    });
    
    // 진행률 표시
    if (i % 5 === 0 || i === chunks.length - 1) {
      const progress = ((i + 1) / chunks.length * 100).toFixed(1);
      console.log(`  📊 ${range.name}: ${progress}% (${successCount}개 발견)`);
    }
    
    await delay(100); // 짧은 휴식
  }
  
  console.log(`✅ ${range.name} 완료: ${successCount}개 몬스터 발견`);
  return results;
}

// 메인 함수
async function generateAllMonsters() {
  console.log('🚀 전체 몬스터 데이터 생성 시작...');
  console.log(`📋 ${EXTENDED_MONSTER_RANGES.length}개 범위, 동시 요청: ${CONCURRENT_REQUESTS}`);
  
  const startTime = Date.now();
  const allResults = {};
  
  for (let i = 0; i < EXTENDED_MONSTER_RANGES.length; i++) {
    const range = EXTENDED_MONSTER_RANGES[i];
    console.log(`\n[${i + 1}/${EXTENDED_MONSTER_RANGES.length}] ${range.name} 시작...`);
    
    const rangeResults = await processRange(range, CONCURRENT_REQUESTS);
    Object.assign(allResults, rangeResults);
    
    const totalFound = Object.keys(allResults).length;
    console.log(`📈 누적 발견: ${totalFound}개 몬스터`);
    
    // 범위간 휴식
    if (i < EXTENDED_MONSTER_RANGES.length - 1) {
      await delay(1000);
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  // 결과 저장
  const outputPath = path.join(__dirname, '..', 'public', 'monsters-complete.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf8');
  
  console.log(`\n🎉 전체 완료! ${Object.keys(allResults).length}개 몬스터 (${duration}초)`);
  console.log(`📁 저장 위치: ${outputPath}`);
  
  // 상세 통계
  const monsters = Object.values(allResults);
  const bosses = monsters.filter(m => m.boss);
  const levelGroups = {
    '1-10': monsters.filter(m => m.level >= 1 && m.level <= 10).length,
    '11-50': monsters.filter(m => m.level >= 11 && m.level <= 50).length,
    '51-100': monsters.filter(m => m.level >= 51 && m.level <= 100).length,
    '101-150': monsters.filter(m => m.level >= 101 && m.level <= 150).length,
    '151-200': monsters.filter(m => m.level >= 151 && m.level <= 200).length,
    '200+': monsters.filter(m => m.level > 200).length,
  };
  
  console.log('\n📊 최종 통계:');
  console.log(`   총 몬스터: ${monsters.length}개`);
  console.log(`   보스 몬스터: ${bosses.length}개`);
  console.log(`   레벨 분포:`);
  Object.entries(levelGroups).forEach(([range, count]) => {
    console.log(`     ${range}: ${count}개`);
  });
  
  const topLevel = Math.max(...monsters.map(m => m.level));
  const avgLevel = (monsters.reduce((sum, m) => sum + m.level, 0) / monsters.length).toFixed(1);
  console.log(`   최고 레벨: ${topLevel}`);
  console.log(`   평균 레벨: ${avgLevel}`);
  
  return allResults;
}

// 스크립트 실행
if (require.main === module) {
  generateAllMonsters().catch(console.error);
}

module.exports = { generateAllMonsters };