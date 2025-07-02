const fs = require('fs');
const path = require('path');

// 로컬 complete 데이터에서 CDN용 JSON 파일 생성
async function generateCDNData() {
    const outputDir = path.join(__dirname, '../data-cdn');
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('🚀 로컬 complete 데이터에서 CDN용 데이터 생성 시작!\n');
    
    // 1. 몬스터 데이터 생성 (complete-monsters.ts 사용)
    console.log('👾 몬스터 데이터 생성 중...');
    try {
        const monsterPath = path.join(__dirname, '../src/data/complete-monsters.ts');
        if (fs.existsSync(monsterPath)) {
            console.log('  complete-monsters.ts에서 데이터 읽는 중...');
            const monsterFileContent = fs.readFileSync(monsterPath, 'utf8');
            // TypeScript export 제거하고 JSON 추출
            const jsonMatch = monsterFileContent.match(/export const COMPLETE_MONSTERS = ({[\s\S]*});/);
            if (jsonMatch) {
                const monstersData = eval('(' + jsonMatch[1] + ')');
                
                fs.writeFileSync(
                    path.join(outputDir, 'monsters.json'),
                    JSON.stringify(monstersData)
                );
                
                console.log(`✅ ${Object.keys(monstersData).length}개 몬스터 저장`);
            } else {
                console.log('⚠️ complete-monsters.ts에서 데이터 파싱 실패, API 사용');
                await fetchMonstersFromAPI();
            }
        } else {
            console.log('⚠️ complete-monsters.ts 없음, API 사용');
            await fetchMonstersFromAPI();
        }
    } catch (error) {
        console.error('❌ 몬스터 데이터 생성 실패:', error.message);
        await fetchMonstersFromAPI();
    }
    
    // 2. 아이템 데이터 생성 (complete-items.ts를 청크로 분할)
    console.log('\n📦 아이템 데이터 생성 중...');
    const itemChunks = [];
    let totalItems = 0;
    
    try {
        const itemPath = path.join(__dirname, '../src/data/complete-items.ts');
        if (fs.existsSync(itemPath)) {
            console.log('  complete-items.ts에서 데이터 읽는 중...');
            const itemFileContent = fs.readFileSync(itemPath, 'utf8');
            
            // TypeScript export 제거하고 JSON 추출
            const jsonMatch = itemFileContent.match(/export const COMPLETE_ITEMS = ({[\s\S]*});/);
            if (jsonMatch) {
                console.log('  데이터 파싱 중...');
                const itemsData = eval('(' + jsonMatch[1] + ')');
                const allItems = Object.values(itemsData);
                totalItems = allItems.length;
                
                console.log(`  총 ${totalItems}개 아이템 발견, 청크로 분할 중...`);
                
                // 청크 크기 (5000개씩)
                const chunkSize = 5000;
                const chunks = [];
                
                for (let i = 0; i < allItems.length; i += chunkSize) {
                    chunks.push(allItems.slice(i, i + chunkSize));
                }
                
                // 각 청크를 파일로 저장
                for (let i = 0; i < chunks.length; i++) {
                    const chunkData = {};
                    chunks[i].forEach(item => {
                        chunkData[item.id] = item;
                    });
                    
                    const chunkIndex = i + 1;
                    const filename = `items-${chunkIndex}.json`;
                    
                    fs.writeFileSync(
                        path.join(outputDir, filename),
                        JSON.stringify(chunkData)
                    );
                    
                    itemChunks.push({
                        file: filename,
                        count: chunks[i].length,
                        range: `chunk-${chunkIndex}`
                    });
                    
                    console.log(`  ✅ ${filename}: ${chunks[i].length}개 아이템 저장`);
                }
            } else {
                console.log('⚠️ complete-items.ts에서 데이터 파싱 실패, API 사용');
                await fetchItemsFromAPI();
            }
        } else {
            console.log('⚠️ complete-items.ts 없음, API 사용');
            await fetchItemsFromAPI();
        }
    } catch (error) {
        console.error('❌ 아이템 데이터 생성 실패:', error.message);
        await fetchItemsFromAPI();
    }

    // API 폴백 함수들
    async function fetchMonstersFromAPI() {
        console.log('  API에서 몬스터 데이터 가져오는 중...');
        const response = await fetch('https://maplestory.io/api/KMS/389/mob?startPos=0&count=10000');
        const monsters = await response.json();
        
        const monsterData = {};
        monsters.forEach(mob => {
            if (mob.name && mob.name !== 'null') {
                monsterData[mob.id] = {
                    id: mob.id,
                    name: mob.name,
                    level: mob.level || 0,
                    hp: mob.hp || 0,
                    exp: mob.exp || 0
                };
            }
        });
        
        fs.writeFileSync(
            path.join(outputDir, 'monsters.json'),
            JSON.stringify(monsterData)
        );
        
        console.log(`✅ ${Object.keys(monsterData).length}개 몬스터 저장`);
    }

    async function fetchItemsFromAPI() {
        console.log('  API에서 아이템 데이터 가져오는 중...');
        const ranges = [
            { start: 0, count: 10000 },
            { start: 10000, count: 10000 },
            { start: 20000, count: 10000 },
            { start: 30000, count: 10000 },
            { start: 40000, count: 10000 },
            { start: 50000, count: 10000 },
            // 장비 아이템 범위 확장
            { start: 1000000, count: 10000 },  // 1000000-1009999: 얼굴장식
            { start: 1010000, count: 10000 },  // 1010000-1019999: 눈장식  
            { start: 1020000, count: 10000 },  // 1020000-1029999: 귀걸이
            { start: 1030000, count: 10000 },  // 1030000-1039999: 반지
            { start: 1040000, count: 10000 },  // 1040000-1049999: 한벌옷
            { start: 1050000, count: 10000 },  // 1050000-1059999: 상의
            { start: 1060000, count: 10000 },  // 1060000-1069999: 하의  
            { start: 1070000, count: 10000 },  // 1070000-1079999: 신발
            { start: 1080000, count: 10000 },  // 1080000-1089999: 장갑
            { start: 1090000, count: 10000 },  // 1090000-1099999: 방패
            { start: 1100000, count: 10000 },  // 1100000-1109999: 모자
            // 소비/설치/기타/캐시 아이템
            { start: 2000000, count: 10000 },
            { start: 3000000, count: 10000 },
            { start: 4000000, count: 10000 },
            { start: 5000000, count: 10000 }
        ];
        
        for (const range of ranges) {
            try {
                console.log(`    범위 ${range.start} ~ ${range.start + range.count} 처리 중...`);
                const response = await fetch(
                    `https://maplestory.io/api/KMS/389/item?startPos=${range.start}&count=${range.count}`
                );
                const items = await response.json();
                
                const itemData = {};
                items.forEach(item => {
                    // 이름이 있거나, 이름이 없어도 유효한 장비 typeInfo가 있으면 포함
                    const hasValidName = item.name && item.name !== 'null';
                    const hasValidEquipType = item.typeInfo && 
                        item.typeInfo.overallCategory === 'Equip' && 
                        item.typeInfo.category && 
                        item.typeInfo.subCategory;
                    
                    if (hasValidName || hasValidEquipType) {
                        itemData[item.id] = {
                            id: item.id,
                            name: item.name || `${item.typeInfo?.subCategory || 'Unknown'} ${item.id}`,
                            typeInfo: item.typeInfo || {},
                            description: item.description?.description
                        };
                        totalItems++;
                    }
                });
                
                if (Object.keys(itemData).length > 0) {
                    const chunkIndex = itemChunks.length + 1;
                    fs.writeFileSync(
                        path.join(outputDir, `items-${chunkIndex}.json`),
                        JSON.stringify(itemData)
                    );
                    itemChunks.push({
                        file: `items-${chunkIndex}.json`,
                        count: Object.keys(itemData).length,
                        range: `${range.start}-${range.start + range.count}`
                    });
                }
            } catch (error) {
                console.error(`    ❌ 범위 ${range.start} 처리 실패:`, error.message);
            }
            
            // API 속도 제한 대응
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }
    
    // 아이템 인덱스 파일 생성
    fs.writeFileSync(
        path.join(outputDir, 'items-index.json'),
        JSON.stringify({
            totalItems: totalItems,
            chunks: itemChunks,
            generated: new Date().toISOString()
        }, null, 2)
    );
    
    console.log(`✅ ${totalItems}개 아이템을 ${itemChunks.length}개 파일로 분할 저장`);
    
    // 3. 맵 데이터 생성 (complete-maps.ts 사용)
    console.log('\n🗺️ 맵 데이터 생성 중...');
    try {
        const mapPath = path.join(__dirname, '../src/data/complete-maps.ts');
        if (fs.existsSync(mapPath)) {
            console.log('  complete-maps.ts에서 데이터 읽는 중...');
            const mapFileContent = fs.readFileSync(mapPath, 'utf8');
            // TypeScript export 제거하고 JSON 추출
            const jsonMatch = mapFileContent.match(/export const COMPLETE_MAPS = ({[\s\S]*});/);
            if (jsonMatch) {
                const mapsData = eval('(' + jsonMatch[1] + ')');
                
                fs.writeFileSync(
                    path.join(outputDir, 'maps.json'),
                    JSON.stringify(mapsData)
                );
                
                console.log(`✅ ${Object.keys(mapsData).length}개 맵 저장`);
            } else {
                console.log('⚠️ complete-maps.ts에서 데이터 파싱 실패, API 사용');
                await fetchMapsFromAPI();
            }
        } else {
            console.log('⚠️ complete-maps.ts 없음, API 사용');
            await fetchMapsFromAPI();
        }
    } catch (error) {
        console.error('❌ 맵 데이터 생성 실패:', error.message);
        await fetchMapsFromAPI();
    }

    async function fetchMapsFromAPI() {
        console.log('  API에서 맵 데이터 가져오는 중...');
        const response = await fetch('https://maplestory.io/api/KMS/389/map?startPos=0&count=10000');
        const maps = await response.json();
        
        const mapData = {};
        maps.forEach(map => {
            if (map.name && map.name !== 'null') {
                mapData[map.id] = {
                    id: map.id,
                    name: map.name,
                    streetName: map.streetName
                };
            }
        });
        
        fs.writeFileSync(
            path.join(outputDir, 'maps.json'),
            JSON.stringify(mapData)
        );
        
        console.log(`✅ ${Object.keys(mapData).length}개 맵 저장`);
    }
    
    // 4. 메타데이터 파일 생성
    const metadata = {
        version: '389',
        generated: new Date().toISOString(),
        files: {
            monsters: 'monsters.json',
            maps: 'maps.json',
            items: itemChunks.map(c => c.file)
        }
    };
    
    fs.writeFileSync(
        path.join(outputDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
    );
    
    console.log('\n✨ CDN 데이터 생성 완료!');
    console.log(`📁 출력 위치: ${outputDir}`);
    
    // 사용 가이드 출력
    console.log('\n📝 다음 단계:');
    console.log('1. GitHub에 새 레포지토리 생성 (예: maple-util-data)');
    console.log('2. data-cdn 폴더를 새 레포지토리에 푸시:');
    console.log('   cd data-cdn');
    console.log('   git init');
    console.log('   git add .');
    console.log('   git commit -m "Initial data"');
    console.log('   git remote add origin https://github.com/[username]/maple-util-data.git');
    console.log('   git push -u origin main');
    console.log('\n3. jsDelivr CDN URL:');
    console.log('   https://cdn.jsdelivr.net/gh/[username]/maple-util-data@main/monsters.json');
}

// 실행
generateCDNData().catch(console.error);