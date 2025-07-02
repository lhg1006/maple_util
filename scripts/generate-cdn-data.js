const fs = require('fs');
const path = require('path');

// API에서 데이터를 가져와서 CDN용 JSON 파일 생성
async function generateCDNData() {
    const outputDir = path.join(__dirname, '../data-cdn');
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('🚀 CDN용 데이터 생성 시작!\n');
    
    // 1. 몬스터 데이터 생성
    console.log('👾 몬스터 데이터 생성 중...');
    try {
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
    } catch (error) {
        console.error('❌ 몬스터 데이터 생성 실패:', error.message);
    }
    
    // 2. 아이템 데이터 생성 (청크로 분할)
    console.log('\n📦 아이템 데이터 생성 중...');
    const itemChunks = [];
    let totalItems = 0;
    
    // 여러 범위에서 아이템 가져오기
    const ranges = [
        { start: 0, count: 10000 },
        { start: 10000, count: 10000 },
        { start: 20000, count: 10000 },
        { start: 30000, count: 10000 },
        { start: 40000, count: 10000 },
        { start: 50000, count: 10000 },
        { start: 1000000, count: 10000 },
        { start: 2000000, count: 10000 },
        { start: 3000000, count: 10000 },
        { start: 4000000, count: 10000 },
        { start: 5000000, count: 10000 }
    ];
    
    for (const range of ranges) {
        try {
            console.log(`  범위 ${range.start} ~ ${range.start + range.count} 처리 중...`);
            const response = await fetch(
                `https://maplestory.io/api/KMS/389/item?startPos=${range.start}&count=${range.count}`
            );
            const items = await response.json();
            
            const itemData = {};
            items.forEach(item => {
                if (item.name && item.name !== 'null') {
                    itemData[item.id] = {
                        id: item.id,
                        name: item.name,
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
            console.error(`  ❌ 범위 ${range.start} 처리 실패:`, error.message);
        }
        
        // API 속도 제한 대응
        await new Promise(resolve => setTimeout(resolve, 500));
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
    
    // 3. 맵 데이터 생성
    console.log('\n🗺️ 맵 데이터 생성 중...');
    try {
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
    } catch (error) {
        console.error('❌ 맵 데이터 생성 실패:', error.message);
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