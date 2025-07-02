const fs = require('fs');
const path = require('path');

// TypeScript 파일에서 데이터 추출하여 JSON으로 변환
function extractDataFromTS(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // export const NAME = { ... } 패턴 찾기
    const match = content.match(/export const \w+: Record<number, \w+> = ({[\s\S]*});/);
    if (!match) {
        throw new Error('Could not find data export in file');
    }
    
    // JavaScript 객체로 파싱
    const dataString = match[1];
    
    // eval 대신 안전한 방법 사용
    // JSON 형식에 맞게 변환
    try {
        // TypeScript 객체를 JSON으로 변환하기 위한 처리
        let jsonString = dataString
            .replace(/(\w+):/g, '"$1":') // 키에 따옴표 추가
            .replace(/'/g, '"') // 작은따옴표를 큰따옴표로
            .replace(/,\s*}/g, '}') // 마지막 콤마 제거
            .replace(/,\s*]/g, ']'); // 배열의 마지막 콤마 제거
            
        // undefined 값 처리
        jsonString = jsonString.replace(/: undefined/g, ': null');
        
        return JSON.parse(jsonString);
    } catch (error) {
        // JSON 파싱 실패시 다른 방법 시도
        console.log('JSON 파싱 실패, Function 생성 방법 시도...');
        const func = new Function('return ' + dataString);
        return func();
    }
}

async function prepareDataForCDN() {
    const dataDir = path.join(__dirname, '../src/data');
    const outputDir = path.join(__dirname, '../data-cdn');
    
    // 출력 디렉토리 생성
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('🚀 CDN용 데이터 준비 중...\n');
    
    // 1. 아이템 데이터 처리
    try {
        const itemsPath = path.join(dataDir, 'complete-items.ts');
        if (fs.existsSync(itemsPath)) {
            console.log('📦 아이템 데이터 처리 중...');
            const items = extractDataFromTS(itemsPath);
            
            // 크기를 줄이기 위해 청크로 분할
            const itemsArray = Object.entries(items);
            const chunkSize = 5000;
            const chunks = [];
            
            for (let i = 0; i < itemsArray.length; i += chunkSize) {
                chunks.push(itemsArray.slice(i, i + chunkSize));
            }
            
            // 각 청크를 별도 파일로 저장
            chunks.forEach((chunk, index) => {
                const chunkData = Object.fromEntries(chunk);
                fs.writeFileSync(
                    path.join(outputDir, `items-${index + 1}.json`),
                    JSON.stringify(chunkData)
                );
            });
            
            // 인덱스 파일 생성
            fs.writeFileSync(
                path.join(outputDir, 'items-index.json'),
                JSON.stringify({
                    totalItems: itemsArray.length,
                    chunks: chunks.length,
                    files: chunks.map((_, i) => `items-${i + 1}.json`)
                })
            );
            
            console.log(`✅ 아이템: ${itemsArray.length}개를 ${chunks.length}개 파일로 분할`);
        }
    } catch (error) {
        console.error('❌ 아이템 데이터 처리 실패:', error.message);
    }
    
    // 2. 몬스터 데이터 처리
    try {
        const monstersPath = path.join(dataDir, 'complete-monsters.ts');
        if (fs.existsSync(monstersPath)) {
            console.log('👾 몬스터 데이터 처리 중...');
            const monsters = extractDataFromTS(monstersPath);
            
            fs.writeFileSync(
                path.join(outputDir, 'monsters.json'),
                JSON.stringify(monsters)
            );
            
            const size = fs.statSync(path.join(outputDir, 'monsters.json')).size;
            console.log(`✅ 몬스터: ${Object.keys(monsters).length}개 (${(size / 1024 / 1024).toFixed(1)}MB)`);
        }
    } catch (error) {
        console.error('❌ 몬스터 데이터 처리 실패:', error.message);
    }
    
    // 3. 맵 데이터 처리
    try {
        const mapsPath = path.join(dataDir, 'complete-maps.ts');
        if (fs.existsSync(mapsPath)) {
            console.log('🗺️ 맵 데이터 처리 중...');
            const maps = extractDataFromTS(mapsPath);
            
            fs.writeFileSync(
                path.join(outputDir, 'maps.json'),
                JSON.stringify(maps)
            );
            
            const size = fs.statSync(path.join(outputDir, 'maps.json')).size;
            console.log(`✅ 맵: ${Object.keys(maps).length}개 (${(size / 1024 / 1024).toFixed(1)}MB)`);
        }
    } catch (error) {
        console.error('❌ 맵 데이터 처리 실패:', error.message);
    }
    
    // README 생성
    const readme = `# Maple Util Data CDN

이 디렉토리는 메이플스토리 데이터를 CDN으로 서빙하기 위한 JSON 파일들을 포함합니다.

## 파일 구조
- \`items-[n].json\`: 아이템 데이터 (청크로 분할)
- \`items-index.json\`: 아이템 청크 인덱스
- \`monsters.json\`: 몬스터 데이터
- \`maps.json\`: 맵 데이터

## 사용 방법
jsDelivr CDN을 통해 접근:
\`\`\`
https://cdn.jsdelivr.net/gh/[username]/[repo]@main/items-1.json
\`\`\`

## 업데이트
매주 자동으로 업데이트됩니다.
`;
    
    fs.writeFileSync(path.join(outputDir, 'README.md'), readme);
    
    console.log('\n✨ CDN 데이터 준비 완료!');
    console.log(`📁 출력 위치: ${outputDir}`);
    console.log('\n다음 단계:');
    console.log('1. 새로운 GitHub 레포지토리 생성 (예: maple-util-data)');
    console.log('2. data-cdn 폴더의 내용을 새 레포지토리에 푸시');
    console.log('3. 코드에서 CDN URL 업데이트');
}

prepareDataForCDN();