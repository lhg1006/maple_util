const fs = require('fs');
const https = require('https');

const API_BASE = 'https://maplestory.io/api/KMS/389';
const OUTPUT_FILE = 'public/npcs.json';

// 확장된 NPC ID 범위
const NPC_ID_RANGES = [
  // 기본 NPC
  { start: 1000000, end: 1000200 },
  { start: 1001000, end: 1001200 },
  { start: 1002000, end: 1002200 },
  { start: 1003000, end: 1003200 },
  { start: 1004000, end: 1004200 },
  { start: 1005000, end: 1005200 },
  { start: 1010000, end: 1010200 },
  { start: 1011000, end: 1011200 },
  { start: 1012000, end: 1012200 },
  { start: 1013000, end: 1013200 },
  { start: 1020000, end: 1020200 },
  { start: 1021000, end: 1021200 },
  { start: 1022000, end: 1022200 },
  { start: 1023000, end: 1023200 },
  { start: 1032000, end: 1032200 },
  { start: 1050000, end: 1050200 },
  { start: 1052000, end: 1052200 },
  { start: 1061000, end: 1061200 },
  { start: 1090000, end: 1090200 },
  
  // 지역별 NPC (빅토리아 아일랜드)
  { start: 2000000, end: 2000300 },
  { start: 2001000, end: 2001300 },
  { start: 2002000, end: 2002300 },
  { start: 2003000, end: 2003300 },
  { start: 2010000, end: 2010300 }, // 페리온
  { start: 2020000, end: 2020300 }, // 엘리니아
  { start: 2030000, end: 2030300 }, // 커닝시티
  { start: 2040000, end: 2040300 }, // 헤네시스
  { start: 2050000, end: 2050300 }, // 슬리피우드
  { start: 2060000, end: 2060300 }, // 노틸러스
  
  // 다른 대륙
  { start: 2100000, end: 2100300 }, // 오르비스
  { start: 2101000, end: 2101300 }, // 엘나스
  { start: 2102000, end: 2102300 },
  { start: 2103000, end: 2103300 },
  { start: 2110000, end: 2110300 }, // 루디브리엄
  { start: 2111000, end: 2111300 },
  { start: 2112000, end: 2112300 },
  { start: 2120000, end: 2120300 }, // 리프레
  { start: 2130000, end: 2130300 }, // 무릉도원
  { start: 2140000, end: 2140300 },
  { start: 2150000, end: 2150300 },
  
  // 특수 지역
  { start: 2200000, end: 2200300 },
  { start: 2210000, end: 2210300 },
  { start: 2220000, end: 2220300 },
  { start: 2230000, end: 2230300 },
  { start: 2240000, end: 2240300 },
  
  // 이벤트 및 특수 NPC
  { start: 9000000, end: 9000300 },
  { start: 9001000, end: 9001300 },
  { start: 9010000, end: 9010300 },
  { start: 9020000, end: 9020300 },
  { start: 9100000, end: 9100300 },
  { start: 9101000, end: 9101300 },
  { start: 9200000, end: 9200300 },
  { start: 9201000, end: 9201300 },
  { start: 9300000, end: 9300300 },
  { start: 9400000, end: 9400300 },
  { start: 9500000, end: 9500300 }
];

// 딜레이 함수
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// HTTP 요청 함수
function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      timeout: 15000,
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
    if (data.framebooks && Array.isArray(data.framebooks)) {
      const scripts = [];
      data.framebooks.forEach(framebook => {
        if (framebook.script) {
          scripts.push(framebook.script);
        }
      });
      npcData.scripts = scripts.slice(0, 3);
    }
    
    return npcData;
  } catch (error) {
    return null; // 에러는 조용히 무시
  }
}

// 배치 처리 함수
async function processBatch(npcIds, batchSize = 10) {
  const results = [];
  let successCount = 0;
  
  for (let i = 0; i < npcIds.length; i += batchSize) {
    const batch = npcIds.slice(i, i + batchSize);
    const batchPromises = batch.map(id => fetchNPCData(id));
    
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(npcIds.length / batchSize);
    
    console.log(`📦 배치 ${batchNum}/${totalBatches} 처리 중... (${batch[0]} ~ ${batch[batch.length - 1]})`);
    
    const batchResults = await Promise.all(batchPromises);
    const validResults = batchResults.filter(result => result !== null);
    
    results.push(...validResults);
    successCount += validResults.length;
    
    if (validResults.length > 0) {
      console.log(`✅ ${validResults.length}개 NPC 발견 (누적: ${successCount}개)`);
    }
    
    // API 호출 제한을 위한 딜레이
    await delay(100);
  }
  
  return results;
}

// 메인 실행 함수
async function main() {
  console.log('🚀 전체 NPC 데이터 수집 시작...');
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
    
    // 몇 개 샘플 출력
    console.log('\n📝 샘플 NPC들:');
    npcs.slice(0, 3).forEach(npc => {
      console.log(`- ${npc.name} (ID: ${npc.id})`);
    });
    
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