const fs = require('fs');
const path = require('path');

// complete 데이터를 CDN용으로 분할하는 스크립트
async function processCompleteData() {
    const outputDir = path.join(__dirname, '../data-cdn');
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('🚀 complete-*.ts 파일에서 CDN용 데이터 분할 시작!\n');
    
    // 1. complete-items.ts 처리
    console.log('📦 complete-items.ts 처리 중...');
    try {
        // ES modules로 동적 import 사용
        const { COMPLETE_ITEMS } = await import('../src/data/complete-items.ts');
        
        const allItems = Object.values(COMPLETE_ITEMS);
        console.log(`  총 ${allItems.length}개 아이템 발견`);
        
        // 청크 크기 (5000개씩)
        const chunkSize = 5000;
        const chunks = [];
        
        for (let i = 0; i < allItems.length; i += chunkSize) {
            chunks.push(allItems.slice(i, i + chunkSize));
        }
        
        console.log(`  ${chunks.length}개 청크로 분할 중...`);
        
        const itemChunks = [];
        
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
        
        // 아이템 인덱스 파일 생성
        fs.writeFileSync(
            path.join(outputDir, 'items-index.json'),
            JSON.stringify({
                totalItems: allItems.length,
                chunks: itemChunks,
                generated: new Date().toISOString()
            }, null, 2)
        );
        
        console.log(`✅ 총 ${allItems.length}개 아이템을 ${itemChunks.length}개 파일로 분할`);
        
    } catch (error) {
        console.error('❌ complete-items.ts 처리 실패:', error.message);
    }
    
    // 2. complete-monsters.ts 처리
    console.log('\n👾 complete-monsters.ts 처리 중...');
    try {
        const { COMPLETE_MONSTERS } = await import('../src/data/complete-monsters.ts');
        
        fs.writeFileSync(
            path.join(outputDir, 'monsters.json'),
            JSON.stringify(COMPLETE_MONSTERS)
        );
        
        console.log(`✅ ${Object.keys(COMPLETE_MONSTERS).length}개 몬스터 저장`);
        
    } catch (error) {
        console.error('❌ complete-monsters.ts 처리 실패:', error.message);
    }
    
    // 3. complete-maps.ts 처리
    console.log('\n🗺️ complete-maps.ts 처리 중...');
    try {
        const { COMPLETE_MAPS } = await import('../src/data/complete-maps.ts');
        
        fs.writeFileSync(
            path.join(outputDir, 'maps.json'),
            JSON.stringify(COMPLETE_MAPS)
        );
        
        console.log(`✅ ${Object.keys(COMPLETE_MAPS).length}개 맵 저장`);
        
    } catch (error) {
        console.error('❌ complete-maps.ts 처리 실패:', error.message);
    }
    
    // 4. 메타데이터 파일 생성
    const metadata = {
        version: '389',
        generated: new Date().toISOString(),
        source: 'complete-*.ts files',
        files: {
            monsters: 'monsters.json',
            maps: 'maps.json',
            items: 'see items-index.json'
        }
    };
    
    fs.writeFileSync(
        path.join(outputDir, 'metadata.json'),
        JSON.stringify(metadata, null, 2)
    );
    
    console.log('\n✨ complete 데이터 CDN 분할 완료!');
    console.log(`📁 출력 위치: ${outputDir}`);
    
    // 방어구 서브카테고리별 개수 확인
    console.log('\n🛡️ 방어구 서브카테고리별 아이템 수 확인...');
    try {
        const { COMPLETE_ITEMS } = await import('../src/data/complete-items.ts');
        const armorItems = Object.values(COMPLETE_ITEMS).filter(item => 
            item.typeInfo?.overallCategory === 'Equip' && 
            item.typeInfo?.category === 'Armor'
        );

        const subcategoryCounts = {};
        armorItems.forEach(item => {
            const subcat = item.typeInfo.subCategory;
            subcategoryCounts[subcat] = (subcategoryCounts[subcat] || 0) + 1;
        });

        console.log('방어구 서브카테고리별 아이템 수:');
        Object.entries(subcategoryCounts)
            .sort(([,a], [,b]) => b - a)
            .forEach(([subcat, count]) => {
                console.log(`  ${subcat}: ${count}개`);
            });
        console.log(`총 방어구 아이템: ${armorItems.length}개`);
        
    } catch (error) {
        console.error('❌ 방어구 통계 실패:', error.message);
    }
}

// 실행
processCompleteData().catch(console.error);