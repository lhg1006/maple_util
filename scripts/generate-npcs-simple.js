const fs = require('fs');
const https = require('https');

const API_BASE = 'https://maplestory.io/api/KMS/389';
const OUTPUT_FILE = 'public/npcs.json';

// 간단한 NPC ID 범위 (테스트용)
const KNOWN_NPC_IDS = [
  1012000, 1012001, 1012002, 1012003, 1012004, 1012005,
  2000000, 2000001, 2000002, 2001000, 2001001,
  2010000, 2010001, 2020000, 2020001, 2030000, 2030001,
  2040000, 2040001, 2050000, 2050001, 2060000, 2060001,
  2100000, 2100001, 2101000, 2101001, 2110000, 2110001,
  2120000, 2120001, 2130000, 2130001,
  9000000, 9000001, 9001000, 9001001, 9100000, 9100001
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
    console.log(`🔍 NPC ${npcId} 조회 중...`);
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
    
    // 대화 스크립트 추출 (framebooks에서)
    if (data.framebooks && Array.isArray(data.framebooks)) {
      const scripts = [];
      data.framebooks.forEach(framebook => {
        if (framebook.script) {
          scripts.push(framebook.script);
        }
      });
      npcData.scripts = scripts.slice(0, 3); // 최대 3개만
    }
    
    console.log(`✅ NPC ${npcId} 수집 완료: ${npcData.name}`);
    return npcData;
  } catch (error) {
    console.warn(`❌ NPC ${npcId} 실패:`, error.message);
    return null;
  }
}

// 순차 처리 함수
async function processSequentially(npcIds) {
  const results = [];
  
  for (let i = 0; i < npcIds.length; i++) {
    const npcId = npcIds[i];
    console.log(`📦 진행률: ${i + 1}/${npcIds.length} (${((i + 1) / npcIds.length * 100).toFixed(1)}%)`);
    
    const result = await fetchNPCData(npcId);
    if (result) {
      results.push(result);
    }
    
    // API 제한을 위한 딜레이
    await delay(500);
  }
  
  return results;
}

// 메인 실행 함수
async function main() {
  console.log('🚀 NPC 데이터 수집 시작...');
  const startTime = Date.now();
  
  console.log(`📋 총 ${KNOWN_NPC_IDS.length}개 NPC ID 검사 예정`);
  
  try {
    // 순차 처리로 NPC 데이터 수집
    const npcs = await processSequentially(KNOWN_NPC_IDS);
    
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
    
    // 샘플 NPC 출력
    if (npcs.length > 0) {
      console.log('\n📝 샘플 NPC:');
      console.log(JSON.stringify(npcs[0], null, 2));
    }
    
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