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
    
    // 모든 기존 청크 파일 읽기
    const inputDir = path.join(__dirname, '../public/data-cdn');
    const files = fs.readdirSync(inputDir).filter(f => f.startsWith('items-') && f.endsWith('.json') && !f.includes('index'));
    
    console.log(`📦 ${files.length}개 청크 파일 발견`);
    
    // 모든 아이템을 하나의 맵으로 합치기 (중복 자동 제거)
    const allItems = {};
    let totalProcessed = 0;
    let duplicatesRemoved = 0;
    
    for (const file of files) {
        console.log(`  처리 중: ${file}`);
        const filePath = path.join(inputDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        Object.entries(data).forEach(([id, item]) => {
            totalProcessed++;
            if (allItems[id]) {
                duplicatesRemoved++;
                console.log(`    중복 제거: ${id} - ${item.name}`);
            } else {
                allItems[id] = item;
            }
        });
    }
    
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
    
    // 다른 파일들 복사
    const otherFiles = ['monsters.json', 'maps.json', 'metadata.json'];
    for (const file of otherFiles) {
        if (fs.existsSync(path.join(inputDir, file))) {
            fs.copyFileSync(
                path.join(inputDir, file),
                path.join(outputDir, file)
            );
            console.log(`  📄 ${file} 복사됨`);
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