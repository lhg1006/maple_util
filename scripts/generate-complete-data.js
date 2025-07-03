#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://maplestory.io/api/KMS/389';

// API 호출 함수
async function fetchAPI(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API 호출 실패: ${url}`, error.message);
    return null;
  }
}

// 지연 함수
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 완전한 몬스터 데이터 생성
async function generateCompleteMonsterData() {
  console.log('🐾 완전한 몬스터 데이터 생성 중...');
  
  const monsters = {};
  
  try {
    // 더 많은 몬스터 가져오기
    console.log('📋 몬스터 목록 가져오는 중...');
    const monstersData = await fetchAPI(`${BASE_URL}/mob?startPosition=0&count=20000`);
    
    if (!monstersData || !Array.isArray(monstersData)) {
      throw new Error('몬스터 목록을 가져올 수 없습니다');
    }

    console.log(`📋 ${monstersData.length}개 몬스터 발견`);
    
    // 모든 몬스터 기본 정보 저장
    monstersData.forEach((monster, i) => {
      if (!monster.name || monster.name.trim() === '') return;
      
      monsters[monster.id] = {
        id: monster.id,
        name: monster.name,
        level: monster.level || 0,
        hp: monster.hp || 100,
        exp: monster.exp || 10,
        region: monster.region || '알 수 없음',
        maps: monster.foundAt || [],
        attackType: 'melee',
        element: 'neutral',
        description: monster.description || '',
        isBoss: (monster.hp || 0) > 10000,
        originalData: monster
      };
      
      if (i % 2000 === 0 && i > 0) {
        console.log(`   진행률: ${i}/${monstersData.length} (${Math.round(i/monstersData.length*100)}%)`);
      }
    });
    
    console.log(`✅ ${Object.keys(monsters).length}개 몬스터 저장 완료`);
    
  } catch (error) {
    console.error('❌ 몬스터 데이터 생성 실패:', error.message);
  }
  
  return monsters;
}

// 완전한 아이템 데이터 생성
async function generateCompleteItemData() {
  console.log('📦 완전한 아이템 데이터 생성 중...');
  
  const items = {};
  
  // 더 큰 범위로 모든 아이템 가져오기
  const ranges = [
    { start: 0, count: 50000 },
    { start: 50000, count: 50000 },
    { start: 100000, count: 50000 }
  ];
  
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    console.log(`📂 아이템 범위 ${i + 1}/${ranges.length} 처리 중... (${range.start} ~ ${range.start + range.count})`);
    
    try {
      const itemsData = await fetchAPI(`${BASE_URL}/item?startPosition=${range.start}&count=${range.count}`);
      
      if (!itemsData || !Array.isArray(itemsData)) {
        console.warn(`⚠️ 범위 ${range.start} 데이터 없음`);
        continue;
      }
      
      console.log(`📋 ${itemsData.length}개 아이템 발견`);
      
      itemsData.forEach((item, index) => {
        if (!item.name || item.name.trim() === '') return;
        
        items[item.id] = {
          id: item.id,
          name: item.name,
          category: item.typeInfo?.category || 'Unknown',
          subCategory: item.typeInfo?.subCategory || '',
          description: item.desc || '',
          level: item.requiredLevel || 0,
          rarity: getRarityFromId(item.id),
          sellPrice: item.price || 0,
          isCash: item.isCash || false,
          requiredJobs: item.requiredJobs || [],
          requiredGender: item.requiredGender || 0,
          originalData: item
        };
        
        if (index % 5000 === 0 && index > 0) {
          console.log(`   진행률: ${index}/${itemsData.length}`);
        }
      });
      
      await delay(500); // API 호출 간격 조절
      
    } catch (error) {
      console.error(`❌ 범위 ${range.start} 실패:`, error.message);
    }
  }
  
  console.log(`✅ 총 ${Object.keys(items).length}개 아이템 저장 완료`);
  return items;
}

// 완전한 맵 데이터 생성
async function generateCompleteMapData() {
  console.log('🗺️ 완전한 맵 데이터 생성 중...');
  
  const maps = {};
  
  try {
    console.log('📋 API에서 맵 데이터 가져오는 중...');
    const mapData = await fetchAPI(`${BASE_URL}/map?startPosition=0&count=10000`);
    
    if (mapData && Array.isArray(mapData)) {
      mapData.forEach((map, index) => {
        if (map.name && map.name.trim() !== '') {
          maps[map.id] = {
            id: map.id,
            name: map.name,
            streetName: map.streetName || '',
            region: map.streetName || '알 수 없음',
            levelRange: '알 수 없음',
            description: `${map.streetName || ''} 지역의 ${map.name}`,
            originalData: map
          };
        }
        
        if (index % 1000 === 0 && index > 0) {
          console.log(`   진행률: ${index}/${mapData.length}`);
        }
      });
      
      console.log(`📋 API에서 ${mapData.length}개 맵 로드`);
    }
    
  } catch (error) {
    console.error('❌ 맵 데이터 로딩 실패:', error.message);
    // 기본 맵 하나라도 제공
    maps[0] = { 
      id: 0, 
      name: '메이플 아일랜드', 
      region: '초보자 섬', 
      levelRange: '1-10', 
      description: '초보자들의 시작 지역' 
    };
  }
  
  console.log(`📋 ${Object.keys(maps).length}개 맵 생성`);
  return maps;
}

// 유틸리티 함수들
function getRarityFromId(id) {
  if (id >= 9000000) return 'legendary';
  if (id >= 8000000) return 'epic';
  if (id >= 7000000) return 'rare';
  if (id >= 5000000) return 'uncommon';
  return 'common';
}

// TypeScript 파일 생성 함수
function generateTypeScriptFile(data, fileName, interfaceName, description) {
  const dataDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const content = `// ${description}
// 자동 생성된 파일입니다. 수정하지 마세요.
// 생성 일시: ${new Date().toISOString()}

export interface ${interfaceName} {
  id: number;
  name: string;
  [key: string]: any;
}

export const COMPLETE_${fileName.toUpperCase()}: Record<number, ${interfaceName}> = ${JSON.stringify(data, null, 2)};

// 통계
export const ${fileName.toUpperCase()}_STATS = {
  total: ${Object.keys(data).length},
  generated: '${new Date().toISOString()}',
  apiSource: '${BASE_URL}',
};

// 검색 헬퍼
export function searchComplete${interfaceName}s(query: string): ${interfaceName}[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(COMPLETE_${fileName.toUpperCase()}).filter(item =>
    item.name.toLowerCase().includes(lowerQuery)
  );
}
`;
  
  const filePath = path.join(dataDir, `complete-${fileName}.ts`);
  fs.writeFileSync(filePath, content);
  console.log(`✅ ${filePath} 생성 완료`);
}

// 메인 실행 함수
async function main() {
  console.log('🚀 완전한 메이플스토리 데이터베이스 생성 시작!');
  console.log('⏰ 시간이 오래 걸릴 수 있습니다...\n');
  
  try {
    // 모든 데이터 생성
    const [monsters, items, maps] = await Promise.all([
      generateCompleteMonsterData(),
      generateCompleteItemData(),
      generateCompleteMapData()
    ]);
    
    // TypeScript 파일 생성
    generateTypeScriptFile(monsters, 'monsters', 'CompleteMonster', '완전한 몬스터 데이터베이스');
    generateTypeScriptFile(items, 'items', 'CompleteItem', '완전한 아이템 데이터베이스');
    generateTypeScriptFile(maps, 'maps', 'CompleteMap', '완전한 맵 데이터베이스');
    
    console.log('\n🎉 완전한 데이터베이스 생성 완료!');
    console.log(`📊 최종 데이터:`);
    console.log(`   - 몬스터: ${Object.keys(monsters).length}개`);
    console.log(`   - 아이템: ${Object.keys(items).length}개`);
    console.log(`   - 맵: ${Object.keys(maps).length}개`);
    console.log('\n💡 이제 완전한 오프라인 데이터베이스가 준비되었습니다!');
    
  } catch (error) {
    console.error('❌ 데이터베이스 생성 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main };