#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://maplestory.io/api/KMS/284';

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

// 딜레이 함수 (API 제한 방지)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 몬스터 데이터 생성
async function generateMonsterData() {
  console.log('🐾 몬스터 데이터 생성 중...');
  
  const monsters = {};
  const startPosition = 0;
  const count = 10000; // 더 많은 몬스터 로드
  
  try {
    // 몬스터 목록 가져오기
    const monstersData = await fetchAPI(`${BASE_URL}/mob?startPosition=${startPosition}&count=${count}`);
    
    if (!monstersData || !Array.isArray(monstersData)) {
      throw new Error('몬스터 목록을 가져올 수 없습니다');
    }

    console.log(`📋 ${monstersData.length}개 몬스터 발견`);
    
    // 각 몬스터의 상세 정보 가져오기 (전체)
    for (let i = 0; i < monstersData.length; i++) {
      const monster = monstersData[i];
      
      if (!monster.name || monster.name.trim() === '' || monster.name === 'null') {
        continue;
      }
      
      if (i % 100 === 0 || i === monstersData.length - 1) {
        console.log(`🔍 ${i + 1}/${monstersData.length}: ${monster.name} (ID: ${monster.id})`);
      }
      
      try {
        // 기본 정보로 우선 저장 (빠른 처리)
        monsters[monster.id] = {
          id: monster.id,
          name: monster.name,
          level: monster.level || 1,
          hp: 100, // 기본값
          exp: 10, // 기본값
          region: getRegionByLevel(monster.level || 1),
          maps: [],
          attackType: 'melee',
          element: 'neutral',
          description: '',
          isBoss: false,
          physicalDamage: 0,
          magicDamage: 0,
          accuracy: 0,
          speed: 0,
          physicalDefenseRate: 0,
          magicDefenseRate: 0,
        };
        
        // 상세 정보 가져오기 (선별적으로)
        const monsterName = monster.name.toLowerCase();
        const level = monster.level || 1;
        const isImportantMonster = i < 500 || level > 30 || 
                                  monsterName.includes('보스') || 
                                  monsterName.includes('킹') ||
                                  monsterName.includes('달팽이') ||
                                  monsterName.includes('버섯') ||
                                  monsterName.includes('슬라임') ||
                                  monsterName.includes('돼지');
        
        if (isImportantMonster) {
          try {
            const detailData = await fetchAPI(`${BASE_URL}/mob/${monster.id}`);
            
            if (detailData && detailData.meta) {
              monsters[monster.id] = {
                ...monsters[monster.id],
                hp: detailData.meta.maxHP || 100,
                exp: detailData.meta.exp || 10,
                maps: detailData.foundAt || [],
                description: detailData.description || '',
                isBoss: (detailData.meta.maxHP || 0) > 10000,
                physicalDamage: detailData.meta.physicalDamage || 0,
                magicDamage: detailData.meta.magicDamage || 0,
                accuracy: detailData.meta.accuracy || 0,
                speed: detailData.meta.speed || 0,
                physicalDefenseRate: detailData.meta.physicalDefenseRate || 0,
                magicDefenseRate: detailData.meta.magicDefenseRate || 0,
              };
            }
            
            // API 제한 방지
            await delay(30);
          } catch (error) {
            console.warn(`상세 정보 실패 ${monster.name}:`, error.message);
          }
        }
        
      } catch (error) {
        console.error(`❌ ${monster.name} 처리 실패:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 몬스터 데이터 생성 실패:', error.message);
  }
  
  return monsters;
}

// 아이템 데이터 생성
async function generateItemData() {
  console.log('📦 아이템 데이터 생성 중...');
  
  const items = {};
  const categories = ['Equip', 'Use', 'Setup', 'Etc', 'Cash'];
  
  for (const category of categories) {
    console.log(`📂 ${category} 카테고리 처리 중...`);
    
    try {
      const startPosition = getStartPositionForCategory(category);
      const count = getCountForCategory(category);
      
      const itemsData = await fetchAPI(`${BASE_URL}/item?overallCategory=${category}&startPosition=${startPosition}&count=${count}`);
      
      if (!itemsData || !Array.isArray(itemsData)) {
        console.warn(`⚠️ ${category} 카테고리 데이터를 가져올 수 없습니다`);
        continue;
      }
      
      console.log(`📋 ${category}: ${itemsData.length}개 아이템 발견`);
      
      // 각 아이템 처리 (전체)
      for (let i = 0; i < itemsData.length; i++) {
        const item = itemsData[i];
        
        // API 응답 구조 확인을 위한 로그
        if (i === 0) {
          console.log(`   🔍 첫 번째 아이템 구조:`, JSON.stringify(item, null, 2).substring(0, 500));
        }
        
        // 아이템 이름이 있는지 확인 (다양한 구조 지원)
        const itemName = item.name || item.description?.name || item.itemName || '';
        
        if (!itemName || itemName.trim() === '' || itemName === 'null') {
          continue;
        }
        
        items[item.id] = {
          id: item.id,
          name: itemName,
          category: category.toLowerCase(),
          subCategory: item.typeInfo?.subCategory || item.category || '',
          description: item.description?.description || item.desc || '',
          level: item.metaInfo?.reqLevel || item.reqLevel || 0,
          rarity: getRarityFromId(item.id),
          sellPrice: item.metaInfo?.price || item.price || 0,
        };
        
        if (i % 500 === 0 || i === itemsData.length - 1) {
          console.log(`   📝 ${i + 1}/${itemsData.length}: ${itemName}`);
        }
      }
      
      await delay(100); // 카테고리 간 딜레이 단축
      
    } catch (error) {
      console.error(`❌ ${category} 카테고리 실패:`, error.message);
    }
  }
  
  return items;
}

// 맵 데이터 생성 (간단한 버전)
async function generateMapData() {
  console.log('🗺️ 맵 데이터 생성 중...');
  
  // 기본 맵 데이터 (API에서 맵 정보를 가져오기 어려우므로 기본값 사용)
  const maps = {
    0: { id: 0, name: '메이플 아일랜드', region: '초보자 섬', levelRange: '1-10' },
    1: { id: 1, name: '남쪽 숲', region: '초보자 섬', levelRange: '1-5' },
    100: { id: 100, name: '헤네시스', region: '빅토리아 아일랜드', levelRange: '10-30' },
    110: { id: 110, name: '커닝시티', region: '빅토리아 아일랜드', levelRange: '10-30' },
    200: { id: 200, name: '페리온', region: '빅토리아 아일랜드', levelRange: '20-40' },
    300: { id: 300, name: '엘리니아', region: '빅토리아 아일랜드', levelRange: '20-40' },
    400: { id: 400, name: '리스항구', region: '빅토리아 아일랜드', levelRange: '25-45' },
    1000: { id: 1000, name: '오르비스', region: '오르비스', levelRange: '30-60' },
    2000: { id: 2000, name: '엘나스', region: '엘나스', levelRange: '50-80' },
    3000: { id: 3000, name: '루디브리엄', region: '루디브리엄', levelRange: '60-100' },
  };
  
  console.log(`📋 ${Object.keys(maps).length}개 기본 맵 생성`);
  return maps;
}

// 유틸리티 함수들
function getRegionByLevel(level) {
  if (level <= 10) return '초보자 섬';
  if (level <= 30) return '빅토리아 아일랜드';
  if (level <= 60) return '오르비스';
  if (level <= 100) return '루디브리엄';
  if (level <= 150) return '미나르 숲';
  return '고급 지역';
}

function getStartPositionForCategory(category) {
  switch (category) {
    case 'Equip': return 0;
    case 'Use': return 30000;
    case 'Setup': return 40000;
    case 'Etc': return 50000;
    case 'Cash': return 60000;
    default: return 0;
  }
}

function getCountForCategory(category) {
  switch (category) {
    case 'Equip': return 8000;
    case 'Use': return 5000;
    case 'Setup': return 3000;
    case 'Etc': return 5000;
    case 'Cash': return 3000;
    default: return 2000;
  }
}

function getRarityFromId(id) {
  if (id >= 4000000) return 'common'; // 일반 재료
  if (id >= 3000000) return 'rare'; // 특수 아이템
  if (id >= 2000000) return 'common'; // 소비 아이템
  if (id >= 1000000) return 'uncommon'; // 장비
  return 'common';
}

// TypeScript 파일 생성
function generateTypeScriptFile(data, fileName, interfaceName, description) {
  const dataDir = path.join(__dirname, '../src/data');
  
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

export const GENERATED_${fileName.toUpperCase()}: Record<number, ${interfaceName}> = ${JSON.stringify(data, null, 2)};

// 통계
export const ${fileName.toUpperCase()}_STATS = {
  total: ${Object.keys(data).length},
  generated: '${new Date().toISOString()}',
};
`;
  
  const filePath = path.join(dataDir, `generated-${fileName}.ts`);
  fs.writeFileSync(filePath, content);
  console.log(`✅ ${filePath} 생성 완료`);
}

// 메인 실행 함수
async function main() {
  console.log('🚀 메이플스토리 데이터 생성 시작!');
  console.log('⏰ 시간이 오래 걸릴 수 있습니다...\n');
  
  try {
    // 몬스터 데이터 생성
    const monsters = await generateMonsterData();
    generateTypeScriptFile(monsters, 'monsters', 'GeneratedMonster', '자동 생성된 몬스터 데이터');
    
    console.log('\n');
    
    // 아이템 데이터 생성
    const items = await generateItemData();
    generateTypeScriptFile(items, 'items', 'GeneratedItem', '자동 생성된 아이템 데이터');
    
    console.log('\n');
    
    // 맵 데이터 생성
    const maps = await generateMapData();
    generateTypeScriptFile(maps, 'maps', 'GeneratedMap', '자동 생성된 맵 데이터');
    
    console.log('\n🎉 모든 데이터 생성 완료!');
    console.log(`📊 생성된 데이터:`);
    console.log(`   - 몬스터: ${Object.keys(monsters).length}개`);
    console.log(`   - 아이템: ${Object.keys(items).length}개`);
    console.log(`   - 맵: ${Object.keys(maps).length}개`);
    
  } catch (error) {
    console.error('❌ 데이터 생성 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
if (require.main === module) {
  main();
}

module.exports = { main, generateMonsterData, generateItemData, generateMapData };