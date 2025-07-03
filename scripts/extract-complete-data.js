const fs = require('fs');
const path = require('path');

// complete 데이터를 텍스트로 읽어서 추출
async function extractCompleteData() {
    const outputDir = path.join(__dirname, '../data-cdn');
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('🚀 complete-*.ts 파일에서 텍스트 추출로 CDN 데이터 생성!\n');
    
    // 1. complete-items.ts 처리
    console.log('📦 complete-items.ts 처리 중...');
    try {
        const itemPath = path.join(__dirname, '../src/data/complete-items.ts');
        const content = fs.readFileSync(itemPath, 'utf8');
        
        // COMPLETE_ITEMS: Record<number, CompleteItem> = { 로 시작하는 부분 찾기
        const startIndex = content.indexOf('export const COMPLETE_ITEMS: Record<number, CompleteItem> = {');
        if (startIndex === -1) {
            throw new Error('COMPLETE_ITEMS export를 찾을 수 없습니다');
        }
        
        // 객체의 시작점 찾기
        const objStart = content.indexOf('{', startIndex);
        let objEnd = -1;
        let braceCount = 0;
        
        // 중괄호 매칭으로 객체 끝 찾기
        for (let i = objStart; i < content.length; i++) {
            if (content[i] === '{') braceCount++;
            if (content[i] === '}') braceCount--;
            if (braceCount === 0) {
                objEnd = i;
                break;
            }
        }
        
        if (objEnd === -1) {
            throw new Error('객체 끝을 찾을 수 없습니다');
        }
        
        // JSON 객체 부분 추출
        const jsonString = content.substring(objStart, objEnd + 1);
        
        console.log(`  데이터 부분 추출됨 (${jsonString.length}자)...`);
        
        // JavaScript로 평가하여 객체로 변환
        const itemsData = eval('(' + jsonString + ')');
        const allItems = Object.values(itemsData);
        
        console.log(`  총 ${allItems.length}개 아이템 발견`);
        
        // 청크 크기 (3000개씩 - 더 작게)
        const chunkSize = 3000;
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
        
        // 방어구 통계 확인
        const armorItems = allItems.filter(item => 
            item.typeInfo?.overallCategory === 'Equip' && 
            item.typeInfo?.category === 'Armor'
        );

        const subcategoryCounts = {};
        armorItems.forEach(item => {
            const subcat = item.typeInfo.subCategory;
            subcategoryCounts[subcat] = (subcategoryCounts[subcat] || 0) + 1;
        });

        console.log('\n🛡️ 방어구 서브카테고리별 아이템 수:');
        Object.entries(subcategoryCounts)
            .sort(([,a], [,b]) => b - a)
            .forEach(([subcat, count]) => {
                console.log(`  ${subcat}: ${count}개`);
            });
        console.log(`총 방어구 아이템: ${armorItems.length}개`);
        
    } catch (error) {
        console.error('❌ complete-items.ts 처리 실패:', error.message);
    }
    
    // 2. complete-monsters.ts 처리
    console.log('\n👾 complete-monsters.ts 처리 중...');
    try {
        const monsterPath = path.join(__dirname, '../src/data/complete-monsters.ts');
        const content = fs.readFileSync(monsterPath, 'utf8');
        
        const startIndex = content.indexOf('export const COMPLETE_MONSTERS: Record<number, CompleteMonster> = {');
        if (startIndex === -1) {
            throw new Error('COMPLETE_MONSTERS export를 찾을 수 없습니다');
        }
        
        const objStart = content.indexOf('{', startIndex);
        let objEnd = -1;
        let braceCount = 0;
        
        for (let i = objStart; i < content.length; i++) {
            if (content[i] === '{') braceCount++;
            if (content[i] === '}') braceCount--;
            if (braceCount === 0) {
                objEnd = i;
                break;
            }
        }
        
        const jsonString = content.substring(objStart, objEnd + 1);
        const monstersData = eval('(' + jsonString + ')');
        
        fs.writeFileSync(
            path.join(outputDir, 'monsters.json'),
            JSON.stringify(monstersData)
        );
        
        console.log(`✅ ${Object.keys(monstersData).length}개 몬스터 저장`);
        
    } catch (error) {
        console.error('❌ complete-monsters.ts 처리 실패:', error.message);
    }
    
    // 3. complete-maps.ts 처리
    console.log('\n🗺️ complete-maps.ts 처리 중...');
    try {
        const mapPath = path.join(__dirname, '../src/data/complete-maps.ts');
        const content = fs.readFileSync(mapPath, 'utf8');
        
        const startIndex = content.indexOf('export const COMPLETE_MAPS: Record<number, CompleteMap> = {');
        if (startIndex === -1) {
            throw new Error('COMPLETE_MAPS export를 찾을 수 없습니다');
        }
        
        const objStart = content.indexOf('{', startIndex);
        let objEnd = -1;
        let braceCount = 0;
        
        for (let i = objStart; i < content.length; i++) {
            if (content[i] === '{') braceCount++;
            if (content[i] === '}') braceCount--;
            if (braceCount === 0) {
                objEnd = i;
                break;
            }
        }
        
        const jsonString = content.substring(objStart, objEnd + 1);
        const mapsData = eval('(' + jsonString + ')');
        
        fs.writeFileSync(
            path.join(outputDir, 'maps.json'),
            JSON.stringify(mapsData)
        );
        
        console.log(`✅ ${Object.keys(mapsData).length}개 맵 저장`);
        
    } catch (error) {
        console.error('❌ complete-maps.ts 처리 실패:', error.message);
    }
    
    // 4. 메타데이터 파일 생성
    const metadata = {
        version: '389',
        generated: new Date().toISOString(),
        source: 'complete-*.ts files (text extraction)',
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
    
    // 사용 가이드 출력
    console.log('\n📝 다음 단계:');
    console.log('1. GitHub에 새 레포지토리 생성 (예: maple-util-data)');
    console.log('2. data-cdn 폴더를 새 레포지토리에 푸시:');
    console.log('   cd data-cdn');
    console.log('   git init');
    console.log('   git add .');
    console.log('   git commit -m "Complete data from local files"');
    console.log('   git remote add origin https://github.com/[username]/maple-util-data.git');
    console.log('   git push -u origin main');
    console.log('\n3. jsDelivr CDN URL:');
    console.log('   https://cdn.jsdelivr.net/gh/[username]/maple-util-data@main/monsters.json');
    console.log('   https://cdn.jsdelivr.net/gh/[username]/maple-util-data@main/items-1.json');
}

// 실행
extractCompleteData().catch(console.error);