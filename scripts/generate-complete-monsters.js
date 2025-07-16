const fs = require('fs');
const path = require('path');

// maplestory.io API 설정
const API_BASE_URL = 'https://maplestory.io/api/KMS/389';
const CONCURRENT_REQUESTS = 8; // 동시 요청 수

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
        timeout: 10000
      });
      
      if (response.ok) {
        return await response.json();
      } else if (response.status === 404) {
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

// 전체 몬스터 목록 가져오기
async function getAllMonsterList() {
  console.log('📥 전체 몬스터 목록 가져오는 중...');
  
  try {
    const url = `${API_BASE_URL}/mob`;
    const monsterList = await fetchWithRetry(url);
    
    if (!monsterList || !Array.isArray(monsterList)) {
      throw new Error('몬스터 목록을 가져올 수 없습니다');
    }
    
    console.log(`✅ 전체 몬스터 목록 로드 완료: ${monsterList.length}개`);
    return monsterList;
  } catch (error) {
    console.error('❌ 전체 몬스터 목록 로드 실패:', error);
    return [];
  }
}

// 개별 몬스터 상세 정보 가져오기
async function fetchMonsterDetails(mobId) {
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
      
      // 원본 메타 (필요시)
      _originalMeta: data.meta || {}
    };
  } catch (error) {
    console.error(`❌ 몬스터 ${mobId} 상세 정보 실패:`, error.message);
    return null;
  }
}

// 병렬 배치 처리
async function processBatch(monsterIds, batchNumber, totalBatches, concurrency = CONCURRENT_REQUESTS) {
  console.log(`🔄 배치 ${batchNumber}/${totalBatches} 처리 중... (${monsterIds.length}개)`);
  
  const results = {};
  const chunks = [];
  
  // 청크로 나누기
  for (let i = 0; i < monsterIds.length; i += concurrency) {
    chunks.push(monsterIds.slice(i, i + concurrency));
  }
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    // 병렬 요청
    const promises = chunk.map(mobId => fetchMonsterDetails(mobId));
    const chunkResults = await Promise.all(promises);
    
    // 결과 저장
    chunk.forEach((mobId, index) => {
      if (chunkResults[index]) {
        results[mobId] = chunkResults[index];
        successCount++;
        if (successCount % 50 === 0 || successCount % 10 === 0) {
          console.log(`  ✅ ${mobId}: ${chunkResults[index].name} (Lv.${chunkResults[index].level})`);
        }
      } else {
        errorCount++;
      }
    });
    
    // 진행률 표시
    if (i % 3 === 0 || i === chunks.length - 1) {
      const progress = ((i + 1) / chunks.length * 100).toFixed(1);
      console.log(`  📊 배치 ${batchNumber}: ${progress}% (성공: ${successCount}, 실패: ${errorCount})`);
    }
    
    // 청크 간 짧은 휴식
    await delay(200);
  }
  
  console.log(`✅ 배치 ${batchNumber} 완료: 성공 ${successCount}, 실패 ${errorCount}`);
  return results;
}

// 메인 함수
async function generateCompleteMonsters() {
  console.log('🚀 완전한 몬스터 데이터 생성 시작...');
  console.log(`📋 설정: API=${API_BASE_URL}, 동시 요청: ${CONCURRENT_REQUESTS}`);
  
  const startTime = Date.now();
  
  // 1단계: 전체 몬스터 목록 가져오기
  const monsterList = await getAllMonsterList();
  if (monsterList.length === 0) {
    console.error('❌ 몬스터 목록을 가져올 수 없어 종료합니다.');
    return;
  }
  
  // 몬스터 ID 추출
  const monsterIds = monsterList.map(monster => monster.id);
  console.log(`📝 처리할 몬스터 ID: ${monsterIds.length}개`);
  console.log(`🔢 ID 범위: ${Math.min(...monsterIds)} ~ ${Math.max(...monsterIds)}`);
  
  // 2단계: 배치별로 상세 정보 수집
  const batchSize = 100; // 배치당 몬스터 수
  const batches = [];
  
  for (let i = 0; i < monsterIds.length; i += batchSize) {
    batches.push(monsterIds.slice(i, i + batchSize));
  }
  
  console.log(`🗂️ ${batches.length}개 배치로 분할`);
  
  const allResults = {};
  
  for (let i = 0; i < batches.length; i++) {
    const batchResults = await processBatch(batches[i], i + 1, batches.length, CONCURRENT_REQUESTS);
    Object.assign(allResults, batchResults);
    
    const totalCollected = Object.keys(allResults).length;
    console.log(`📈 누적 수집: ${totalCollected}개 / ${monsterIds.length}개`);
    
    // 배치 간 휴식 (API 제한 고려)
    if (i < batches.length - 1) {
      console.log('⏱️ 배치 간 휴식 (2초)...');
      await delay(2000);
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  // 3단계: 결과 저장
  const outputPath = path.join(__dirname, '..', 'public', 'monsters-final.json');
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2), 'utf8');
  
  console.log(`\n🎉 완전한 몬스터 데이터 수집 완료!`);
  console.log(`📁 저장 위치: ${outputPath}`);
  console.log(`⏱️ 소요 시간: ${duration}초`);
  console.log(`📊 최종 결과: ${Object.keys(allResults).length}개 / ${monsterIds.length}개`);
  
  // 4단계: 상세 통계
  const monsters = Object.values(allResults);
  const bosses = monsters.filter(m => m.boss);
  const levelGroups = {
    '1-10': monsters.filter(m => m.level >= 1 && m.level <= 10).length,
    '11-30': monsters.filter(m => m.level >= 11 && m.level <= 30).length,
    '31-60': monsters.filter(m => m.level >= 31 && m.level <= 60).length,
    '61-100': monsters.filter(m => m.level >= 61 && m.level <= 100).length,
    '101-150': monsters.filter(m => m.level >= 101 && m.level <= 150).length,
    '151-200': monsters.filter(m => m.level >= 151 && m.level <= 200).length,
    '200+': monsters.filter(m => m.level > 200).length,
  };
  
  console.log('\n📊 최종 통계:');
  console.log(`   총 몬스터: ${monsters.length}개`);
  console.log(`   보스 몬스터: ${bosses.length}개`);
  console.log(`   성공률: ${(monsters.length / monsterIds.length * 100).toFixed(1)}%`);
  console.log(`   레벨 분포:`);
  Object.entries(levelGroups).forEach(([range, count]) => {
    console.log(`     ${range}: ${count}개`);
  });
  
  const topLevel = Math.max(...monsters.map(m => m.level));
  const avgLevel = (monsters.reduce((sum, m) => sum + m.level, 0) / monsters.length).toFixed(1);
  console.log(`   최고 레벨: ${topLevel}`);
  console.log(`   평균 레벨: ${avgLevel}`);
  
  // 5단계: 샘플 몬스터 표시
  console.log('\n🎯 수집된 몬스터 샘플:');
  const sampleMonsters = monsters
    .filter(m => m.name && m.level > 0)
    .sort((a, b) => b.level - a.level)
    .slice(0, 10);
  
  sampleMonsters.forEach(monster => {
    const bossText = monster.boss ? ' [보스]' : '';
    console.log(`   ${monster.name} (Lv.${monster.level})${bossText}`);
  });
  
  return allResults;
}

// 스크립트 실행
if (require.main === module) {
  generateCompleteMonsters().catch(console.error);
}

module.exports = { generateCompleteMonsters };