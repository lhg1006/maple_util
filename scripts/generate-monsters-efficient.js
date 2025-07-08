const fs = require('fs');
const path = require('path');

// maplestory.io API 설정
const API_BASE_URL = 'https://maplestory.io/api/KMS/389';
const CONCURRENT_REQUESTS = 10; // 더 많은 동시 요청
const SAVE_INTERVAL = 500; // 500개마다 중간 저장

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
          'User-Agent': 'Mozilla/5.0',
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
      await delay(500);
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

// 개별 몬스터 상세 정보 가져오기 (간소화)
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
      
      // 핵심 전투 정보만
      pad: data.meta?.physicalDamage || 0,
      mad: data.meta?.magicDamage || 0,
      pdr: data.meta?.physicalDefenseRate || 0,
      mdr: data.meta?.magicDefenseRate || 0,
      acc: data.meta?.accuracy || 0,
      speed: data.meta?.speed || 0,
      
      // 기본 특성
      bodyAttack: data.meta?.isBodyAttack || false,
      boss: data.meta?.isBoss || false,
      
      // 위치 (간소화)
      foundAt: (data.foundAt || []).slice(0, 5), // 최대 5개만
    };
  } catch (error) {
    return null;
  }
}

// 빠른 병렬 처리
async function processBatchFast(monsterIds, batchNumber, totalBatches) {
  console.log(`🔄 배치 ${batchNumber}/${totalBatches} 처리 중... (${monsterIds.length}개)`);
  
  const chunks = [];
  for (let i = 0; i < monsterIds.length; i += CONCURRENT_REQUESTS) {
    chunks.push(monsterIds.slice(i, i + CONCURRENT_REQUESTS));
  }
  
  const results = {};
  let successCount = 0;
  
  for (const chunk of chunks) {
    const promises = chunk.map(mobId => fetchMonsterDetails(mobId));
    const chunkResults = await Promise.all(promises);
    
    chunk.forEach((mobId, index) => {
      if (chunkResults[index]) {
        results[mobId] = chunkResults[index];
        successCount++;
      }
    });
    
    await delay(100); // 짧은 휴식
  }
  
  console.log(`✅ 배치 ${batchNumber} 완료: ${successCount}개 성공`);
  return results;
}

// 중간 저장 함수
function saveProgress(data, filename) {
  const outputPath = path.join(__dirname, '..', 'public', filename);
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`💾 중간 저장: ${Object.keys(data).length}개 → ${filename}`);
}

// 메인 함수 (최적화)
async function generateMonstersEfficient() {
  console.log('🚀 효율적인 몬스터 데이터 생성 시작...');
  
  const startTime = Date.now();
  
  // 1단계: 전체 몬스터 목록 가져오기
  const monsterList = await getAllMonsterList();
  if (monsterList.length === 0) {
    console.error('❌ 종료');
    return;
  }
  
  const monsterIds = monsterList.map(monster => monster.id);
  console.log(`📝 총 ${monsterIds.length}개 몬스터`);
  
  // 2단계: 빠른 배치 처리
  const batchSize = 200; // 더 큰 배치
  const batches = [];
  
  for (let i = 0; i < monsterIds.length; i += batchSize) {
    batches.push(monsterIds.slice(i, i + batchSize));
  }
  
  console.log(`🗂️ ${batches.length}개 배치`);
  
  const allResults = {};
  
  for (let i = 0; i < batches.length; i++) {
    const batchResults = await processBatchFast(batches[i], i + 1, batches.length);
    Object.assign(allResults, batchResults);
    
    const totalCollected = Object.keys(allResults).length;
    console.log(`📈 누적: ${totalCollected}개`);
    
    // 중간 저장 (500개마다)
    if (totalCollected % SAVE_INTERVAL === 0 || i === batches.length - 1) {
      saveProgress(allResults, 'monsters-progress.json');
    }
    
    // 짧은 휴식
    if (i < batches.length - 1) {
      await delay(1000);
    }
  }
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  // 3단계: 최종 저장
  const finalPath = path.join(__dirname, '..', 'public', 'monsters-ultimate.json');
  fs.writeFileSync(finalPath, JSON.stringify(allResults, null, 2), 'utf8');
  
  console.log(`\n🎉 최종 완료!`);
  console.log(`📁 ${finalPath}`);
  console.log(`⏱️ ${duration}초`);
  console.log(`📊 ${Object.keys(allResults).length}개 / ${monsterIds.length}개`);
  
  // 4단계: 통계
  const monsters = Object.values(allResults);
  const bosses = monsters.filter(m => m.boss);
  const maxLevel = Math.max(...monsters.map(m => m.level));
  const avgLevel = (monsters.reduce((sum, m) => sum + m.level, 0) / monsters.length).toFixed(1);
  
  console.log(`   보스: ${bosses.length}개`);
  console.log(`   최고 레벨: ${maxLevel}`);
  console.log(`   평균 레벨: ${avgLevel}`);
  
  // 샘플 표시
  const highLevelMonsters = monsters
    .filter(m => m.level > 200)
    .sort((a, b) => b.level - a.level)
    .slice(0, 5);
  
  console.log('\n🏆 고레벨 몬스터 샘플:');
  highLevelMonsters.forEach(m => {
    console.log(`   ${m.name} (Lv.${m.level})`);
  });
  
  return allResults;
}

// 스크립트 실행
if (require.main === module) {
  generateMonstersEfficient().catch(console.error);
}

module.exports = { generateMonstersEfficient };