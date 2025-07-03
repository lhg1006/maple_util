const fs = require('fs');
const path = require('path');

// TypeScript 파일을 JSON으로 변환하는 스크립트
async function exportDataAsJson() {
    const dataDir = path.join(__dirname, '../src/data');
    const outputDir = path.join(__dirname, '../public/data');
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('📦 데이터를 JSON으로 변환 중...');
    
    // complete-items.ts 처리
    try {
        console.log('🔄 아이템 데이터 변환 중...');
        const itemsModule = require('../src/data/complete-items');
        const items = itemsModule.COMPLETE_ITEMS;
        
        // 필수 필드만 추출하여 크기 최소화
        const minifiedItems = {};
        Object.entries(items).forEach(([key, item]) => {
            minifiedItems[key] = {
                id: item.id,
                name: item.name,
                category: item.category,
                subcategory: item.subcategory,
                description: item.description,
                typeInfo: item.originalData?.typeInfo || {},
                isCash: item.isCash,
                sellPrice: item.sellPrice
            };
        });
        
        fs.writeFileSync(
            path.join(outputDir, 'items.json'),
            JSON.stringify(minifiedItems)
        );
        
        const itemsSize = fs.statSync(path.join(outputDir, 'items.json')).size;
        console.log(`✅ 아이템: ${Object.keys(minifiedItems).length}개 (${(itemsSize / 1024 / 1024).toFixed(1)}MB)`);
    } catch (error) {
        console.error('❌ 아이템 데이터 변환 실패:', error.message);
    }
    
    // complete-monsters.ts 처리
    try {
        console.log('🔄 몬스터 데이터 변환 중...');
        const monstersModule = require('../src/data/complete-monsters');
        const monsters = monstersModule.COMPLETE_MONSTERS;
        
        const minifiedMonsters = {};
        Object.entries(monsters).forEach(([key, monster]) => {
            minifiedMonsters[key] = {
                id: monster.id,
                name: monster.name,
                level: monster.level,
                hp: monster.hp,
                exp: monster.exp,
                region: monster.region,
                maps: monster.maps
            };
        });
        
        fs.writeFileSync(
            path.join(outputDir, 'monsters.json'),
            JSON.stringify(minifiedMonsters)
        );
        
        const monstersSize = fs.statSync(path.join(outputDir, 'monsters.json')).size;
        console.log(`✅ 몬스터: ${Object.keys(minifiedMonsters).length}개 (${(monstersSize / 1024 / 1024).toFixed(1)}MB)`);
    } catch (error) {
        console.error('❌ 몬스터 데이터 변환 실패:', error.message);
    }
    
    // complete-maps.ts 처리
    try {
        console.log('🔄 맵 데이터 변환 중...');
        const mapsModule = require('../src/data/complete-maps');
        const maps = mapsModule.COMPLETE_MAPS;
        
        const minifiedMaps = {};
        Object.entries(maps).forEach(([key, map]) => {
            minifiedMaps[key] = {
                id: map.id,
                name: map.name,
                streetName: map.streetName,
                region: map.region
            };
        });
        
        fs.writeFileSync(
            path.join(outputDir, 'maps.json'),
            JSON.stringify(minifiedMaps)
        );
        
        const mapsSize = fs.statSync(path.join(outputDir, 'maps.json')).size;
        console.log(`✅ 맵: ${Object.keys(minifiedMaps).length}개 (${(mapsSize / 1024 / 1024).toFixed(1)}MB)`);
    } catch (error) {
        console.error('❌ 맵 데이터 변환 실패:', error.message);
    }
    
    console.log('\n📊 JSON 변환 완료!');
    console.log('📁 출력 위치: public/data/');
}

exportDataAsJson();