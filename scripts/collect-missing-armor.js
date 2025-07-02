const fs = require('fs');
const path = require('path');

async function collectMissingArmor() {
    console.log('🔍 누락된 방어구 아이템 수집 시작...\n');
    
    // 방어구 아이템 ID 범위들 (알려진 범위)
    const armorRanges = [
        { start: 1040000, end: 1049999, type: 'Overall' },    // 한벌옷
        { start: 1050000, end: 1059999, type: 'Top' },       // 상의
        { start: 1060000, end: 1069999, type: 'Bottom' },    // 하의  
        { start: 1070000, end: 1079999, type: 'Shoes' },     // 신발
        { start: 1080000, end: 1089999, type: 'Glove' },     // 장갑
        { start: 1090000, end: 1099999, type: 'Shield' },    // 방패
        { start: 1100000, end: 1109999, type: 'Hat' },       // 모자
    ];
    
    const collectedItems = {};
    let totalCollected = 0;
    
    for (const range of armorRanges) {
        console.log(`📦 ${range.type} 아이템 수집 중 (${range.start}-${range.end})...`);
        let rangeCount = 0;
        
        // 샘플링: 500개씩 건너뛰면서 확인 (더 빠르게)
        for (let id = range.start; id <= range.end; id += 500) {
            try {
                const response = await fetch(`https://maplestory.io/api/KMS/389/item/${id}`);
                const item = await response.json();
                
                if (item && item.typeInfo && item.typeInfo.overallCategory === 'Equip') {
                    collectedItems[item.id] = {
                        id: item.id,
                        name: item.name || `${item.typeInfo.subCategory} ${item.id}`,
                        typeInfo: item.typeInfo,
                        description: item.description?.description
                    };
                    rangeCount++;
                    totalCollected++;
                    
                    // 진행상황 표시
                    if (rangeCount % 10 === 0) {
                        process.stdout.write('.');
                    }
                }
                
                // API 제한 방지를 위한 딜레이
                await new Promise(resolve => setTimeout(resolve, 10));
                
            } catch (error) {
                // 에러는 무시하고 계속 진행
            }
        }
        
        console.log(`\n✅ ${range.type}: ${rangeCount}개 수집`);
    }
    
    console.log(`\n🎉 총 ${totalCollected}개의 추가 방어구 아이템 수집 완료!`);
    
    // 기존 데이터와 병합
    const outputDir = path.join(__dirname, '../data-cdn');
    const existingFile = path.join(outputDir, 'missing-armor.json');
    
    fs.writeFileSync(existingFile, JSON.stringify(collectedItems, null, 2));
    console.log(`💾 missing-armor.json 파일에 저장 완료`);
    
    return collectedItems;
}

// 스크립트 실행
if (require.main === module) {
    collectMissingArmor().catch(console.error);
}

module.exports = { collectMissingArmor };