const fs = require('fs');
const https = require('https');

const API_BASE = 'https://maplestory.io/api/KMS/389';
const OUTPUT_FILE = 'public/npcs.json';

// NPC ID 범위 설정
const NPC_ID_RANGES = [
  { start: 1000000, end: 1000100 }, // 일반 NPC
  { start: 1001000, end: 1001100 }, // 상점 NPC
  { start: 1002000, end: 1002100 }, // 퀘스트 NPC
  { start: 1010000, end: 1010100 }, // 특수 NPC
  { start: 1012000, end: 1012100 }, // 기타 NPC
  { start: 2000000, end: 2000100 }, // 빅토리아 아일랜드
  { start: 2001000, end: 2001100 }, // 엘나스
  { start: 2002000, end: 2002100 }, // 루디브리엄
  { start: 2003000, end: 2003100 }, // 아랫마을
  { start: 2010000, end: 2010100 }, // 페리온
  { start: 2020000, end: 2020100 }, // 엘리니아
  { start: 2030000, end: 2030100 }, // 커닝시티
  { start: 2040000, end: 2040100 }, // 헤네시스
  { start: 2050000, end: 2050100 }, // 슬리피우드
  { start: 2060000, end: 2060100 }, // 노틸러스
  { start: 2100000, end: 2100100 }, // 오르비스
  { start: 2101000, end: 2101100 }, // 엘나스
  { start: 2110000, end: 2110100 }, // 루디브리엄
  { start: 2120000, end: 2120100 }, // 리프레
  { start: 2130000, end: 2130100 }, // 무릉도원
  { start: 9000000, end: 9000100 }, // GM NPC
  { start: 9001000, end: 9001100 }, // 이벤트 NPC
  { start: 9100000, end: 9100100 }, // 특별 NPC
];

// 딜레이 함수
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// HTTP 요청 함수
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'MapleUtil-NPC-Collector/1.0'
      }
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 404) {
          resolve(null); // NPC가 존재하지 않음
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (err) {
            reject(new Error('JSON 파싱 실패'));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// NPC 데이터 가져오기
async function fetchNPCData(npcId) {
  try {
    const data = await httpGet(`${API_BASE}/npc/${npcId}`);
    
    if (!data) {
      return null; // NPC가 존재하지 않음
    }
    
    // NPC 데이터 구조 확인 및 정리
    const npcData = {
      id: data.id,
      name: data.name || `NPC ${npcId}`,
      description: data.description || '',
      location: '',
      scripts: []
    };
    
    // 위치 정보 추출
    if (data.locations && data.locations.length > 0) {
      npcData.location = data.locations[0].name || '';
    }
    
    // 대화 스크립트 추출
    if (data.dialogue && Array.isArray(data.dialogue)) {
      npcData.scripts = data.dialogue.slice(0, 5); // 최대 5개만
    }
    
    return npcData;
  } catch (error) {
    console.warn(`❌ NPC ${npcId} 실패:`, error.message);
    return null;
  }
}

// 배치 처리 함수
async function processBatch(npcIds, batchSize = 5) {
  const results = [];
  
  for (let i = 0; i < npcIds.length; i += batchSize) {
    const batch = npcIds.slice(i, i + batchSize);
    const batchPromises = batch.map(id => fetchNPCData(id));
    
    console.log(`📦 배치 ${Math.floor(i / batchSize) + 1}/${Math.ceil(npcIds.length / batchSize)} 처리 중... (${batch[0]} ~ ${batch[batch.length - 1]})`);
    
    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(result => result !== null);
    
    results.push(...validResults);
    
    if (validResults.length > 0) {
      console.log(`✅ ${validResults.length}개 NPC 발견`);
    }
    
    // API 호출 제한을 위한 딜레이
    await delay(200);
  }
  
  return results;
}

// 메인 실행 함수
async function main() {
  console.log('🚀 NPC 데이터 수집 시작...');
  const startTime = Date.now();
  
  // 모든 NPC ID 생성
  const allNPCIds = [];
  for (const range of NPC_ID_RANGES) {
    for (let id = range.start; id <= range.end; id++) {
      allNPCIds.push(id);
    }
  }
  
  console.log(`📋 총 ${allNPCIds.length}개 NPC ID 검사 예정`);
  
  try {
    // 배치 처리로 NPC 데이터 수집
    const npcs = await processBatch(allNPCIds);
    
    if (npcs.length === 0) {
      console.log('❌ 수집된 NPC가 없습니다.');
      return;
    }
    
    // NPC ID를 키로 하는 객체로 변환
    const npcData = {};
    npcs.forEach(npc => {
      npcData[npc.id] = npc;
    });
    
    // 파일 저장
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(npcData, null, 2), 'utf8');
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);
    
    console.log(`✨ NPC 데이터 수집 완료!`);
    console.log(`📊 총 ${npcs.length}개 NPC 수집됨`);
    console.log(`⏱️  소요 시간: ${duration}초`);
    console.log(`💾 저장 위치: ${OUTPUT_FILE}`);
    
    // 통계 정보
    const withLocation = npcs.filter(npc => npc.location).length;
    const withScripts = npcs.filter(npc => npc.scripts && npc.scripts.length > 0).length;
    
    console.log('\n📈 수집 통계:');
    console.log(`- 위치 정보 있음: ${withLocation}개`);
    console.log(`- 대화 스크립트 있음: ${withScripts}개`);
    
  } catch (error) {
    console.error('❌ NPC 데이터 수집 실패:', error);
    process.exit(1);
  }
}

// 실행
if (require.main === module) {
  main();
}

module.exports = { main };