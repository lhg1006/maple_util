const fs = require('fs');
const path = require('path');

// 중복 아이템 제거 및 정리
async function deduplicateItems() {
    const outputDir = path.join(__dirname, '../data-cdn-clean');
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('🔧 중복 아이템 제거 및 데이터 정리 시작!\n');
    
    // complete-items.ts 파일에서 데이터 추출
    const completeItemsPath = path.join(__dirname, '../public/maple-data/complete-items.ts');
    console.log('📂 complete-items.ts 파일 읽는 중...');
    
    const fileContent = fs.readFileSync(completeItemsPath, 'utf8');
    
    // export const COMPLETE_ITEMS = { 부분 찾기
    const startMatch = fileContent.match(/export const COMPLETE_ITEMS[^=]*=\s*{/);
    if (!startMatch) {
        throw new Error('COMPLETE_ITEMS 객체를 찾을 수 없습니다');
    }
    
    const startPos = startMatch.index + startMatch[0].length - 1; // { 포함
    let braceCount = 0;
    let endPos = startPos;
    
    // 매칭되는 } 찾기
    for (let i = startPos; i < fileContent.length; i++) {
        if (fileContent[i] === '{') braceCount++;
        if (fileContent[i] === '}') braceCount--;
        if (braceCount === 0) {
            endPos = i;
            break;
        }
    }
    
    const objectStr = fileContent.slice(startPos, endPos + 1);
    console.log('📊 파싱된 객체 크기:', Math.round(objectStr.length / 1024), 'KB');
    
    // JSON으로 파싱 (eval 대신 안전한 방법)
    const cleanedStr = objectStr
        .replace(/'/g, '"')
        .replace(/(\w+):/g, '"$1":')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');
    
    let allItems;
    try {
        allItems = JSON.parse(cleanedStr);
    } catch (e) {
        console.error('JSON 파싱 실패:', e.message);
        // 백업 방법: eval 사용 (주의!)
        console.log('백업 방법으로 eval 사용...');
        allItems = eval('(' + objectStr + ')');
    }
    
    const totalProcessed = Object.keys(allItems).length;
    console.log(`📦 총 ${totalProcessed}개 아이템 로드됨`);
    
    // 중복 확인 (ID 기준)
    const uniqueItems = {};
    let duplicatesRemoved = 0;
    
    Object.entries(allItems).forEach(([id, item]) => {
        if (uniqueItems[id]) {
            duplicatesRemoved++;
        } else {
            uniqueItems[id] = item;
        }
    });
    
    allItems = uniqueItems;
    
    console.log(`\n📊 처리 완료:`);
    console.log(`  총 처리된 아이템: ${totalProcessed}개`);
    console.log(`  중복 제거된 아이템: ${duplicatesRemoved}개`);
    console.log(`  최종 고유 아이템: ${Object.keys(allItems).length}개`);
    
    // 정리된 아이템을 청크로 분할 (1500개씩)
    const cleanItems = Object.values(allItems);
    const chunkSize = 1500;
    const chunks = [];
    
    for (let i = 0; i < cleanItems.length; i += chunkSize) {
        chunks.push(cleanItems.slice(i, i + chunkSize));
    }
    
    console.log(`\n📦 ${chunks.length}개 청크로 분할 중...`);
    
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
            totalItems: cleanItems.length,
            chunks: itemChunks,
            generated: new Date().toISOString(),
            note: "Deduplicated and cleaned data"
        }, null, 2)
    );
    
    // 몬스터 데이터 추출
    console.log('\n📂 몬스터 데이터 추출 중...');
    const monstersPath = path.join(__dirname, '../public/maple-data/complete-monsters.ts');
    const monstersContent = fs.readFileSync(monstersPath, 'utf8');
    const monstersMatch = monstersContent.match(/export const COMPLETE_MONSTERS[^=]*=\s*{/);
    if (monstersMatch) {
        const startPos = monstersMatch.index + monstersMatch[0].length - 1;
        let braceCount = 0;
        let endPos = startPos;
        
        for (let i = startPos; i < monstersContent.length; i++) {
            if (monstersContent[i] === '{') braceCount++;
            if (monstersContent[i] === '}') braceCount--;
            if (braceCount === 0) {
                endPos = i;
                break;
            }
        }
        
        const monstersStr = monstersContent.slice(startPos, endPos + 1);
        console.log('몬스터 객체 크기:', Math.round(monstersStr.length / 1024), 'KB');
        
        try {
            const monsters = eval('(' + monstersStr + ')');
            fs.writeFileSync(
                path.join(outputDir, 'monsters.json'),
                JSON.stringify(monsters)
            );
            console.log(`  ✅ monsters.json: ${Object.keys(monsters).length}개 몬스터 저장`);
        } catch (e) {
            console.error('몬스터 데이터 처리 실패:', e.message);
        }
    }

    // 맵 데이터 추출
    console.log('📂 맵 데이터 추출 중...');
    const mapsPath = path.join(__dirname, '../public/maple-data/complete-maps.ts');
    const mapsContent = fs.readFileSync(mapsPath, 'utf8');
    const mapsMatch = mapsContent.match(/export const COMPLETE_MAPS[^=]*=\s*{/);
    if (mapsMatch) {
        const startPos = mapsMatch.index + mapsMatch[0].length - 1;
        let braceCount = 0;
        let endPos = startPos;
        
        for (let i = startPos; i < mapsContent.length; i++) {
            if (mapsContent[i] === '{') braceCount++;
            if (mapsContent[i] === '}') braceCount--;
            if (braceCount === 0) {
                endPos = i;
                break;
            }
        }
        
        const mapsStr = mapsContent.slice(startPos, endPos + 1);
        console.log('맵 객체 크기:', Math.round(mapsStr.length / 1024), 'KB');
        
        try {
            const maps = eval('(' + mapsStr + ')');
            fs.writeFileSync(
                path.join(outputDir, 'maps.json'),
                JSON.stringify(maps)
            );
            console.log(`  ✅ maps.json: ${Object.keys(maps).length}개 맵 저장`);
        } catch (e) {
            console.error('맵 데이터 처리 실패:', e.message);
        }
    }
    
    // 메타데이터 업데이트
    const metadata = {
        version: '389',
        generated: new Date().toISOString(),
        source: 'complete-*.ts files (deduplicated)',
        totalItems: cleanItems.length,
        duplicatesRemoved: duplicatesRemoved,
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
    
    console.log(`\n✨ 정리 완료!`);
    console.log(`📁 출력 위치: ${outputDir}`);
    
    // 중복 제거 후 소비아이템 통계
    const useItems = cleanItems.filter(item => {
        const typeInfo = item.originalData?.typeInfo || item.typeInfo;
        return typeInfo?.overallCategory === 'Use';
    });
    
    const useCategories = {};
    useItems.forEach(item => {
        const typeInfo = item.originalData?.typeInfo || item.typeInfo;
        const category = typeInfo?.category || 'Unknown';
        useCategories[category] = (useCategories[category] || 0) + 1;
    });
    
    console.log(`\n📊 소비아이템 통계 (중복 제거 후):`);
    console.log(`  총 소비아이템: ${useItems.length}개`);
    Object.entries(useCategories)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
            console.log(`  ${category}: ${count}개`);
        });
    
    return outputDir;
}

// 실행
deduplicateItems().catch(console.error);