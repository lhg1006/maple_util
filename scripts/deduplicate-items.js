const fs = require('fs');
const path = require('path');

// 아이템에 장비 상세 정보 추가
function enhanceItemWithStats(item) {
    const enhanced = { ...item };
    const originalData = item.originalData || {};
    
    // 장비인지 확인
    const typeInfo = originalData.typeInfo || item.typeInfo;
    const isEquipment = typeInfo?.overallCategory === 'Equip';
    
    if (isEquipment) {
        // 현재 데이터에서 사용 가능한 정보로 요구 조건 설정
        enhanced.requirements = {
            level: originalData.requiredLevel || item.level || 0,
            str: getRequiredStat(item, 'STR'),
            dex: getRequiredStat(item, 'DEX'), 
            int: getRequiredStat(item, 'INT'),
            luk: getRequiredStat(item, 'LUK'),
            job: originalData.requiredJobs ? getJobId(originalData.requiredJobs[0]) : 0,
        };
        
        // 레벨 기반 추정 스탯 (임시)
        const estimatedStats = getEstimatedStats(item);
        
        // 공격/방어 스탯 (레벨 기반 추정)
        enhanced.combat = {
            attack: estimatedStats.attack,
            magicAttack: estimatedStats.magicAttack,
            defense: estimatedStats.defense,
            magicDefense: estimatedStats.magicDefense,
            accuracy: estimatedStats.accuracy,
            avoidability: estimatedStats.avoidability,
            speed: 0,
            jump: 0,
        };
        
        // 스탯 증가 (레벨 기반 추정)
        enhanced.stats = {
            str: estimatedStats.statBonus.str,
            dex: estimatedStats.statBonus.dex,
            int: estimatedStats.statBonus.int,
            luk: estimatedStats.statBonus.luk,
            hp: estimatedStats.statBonus.hp,
            mp: estimatedStats.statBonus.mp,
        };
        
        // 강화 정보
        enhanced.enhancement = {
            upgradeSlots: getUpgradeSlots(item),
            attackSpeed: getAttackSpeed(item),
            isUnique: item.rarity === 'unique' || item.name.includes('유니크'),
            isCash: item.isCash || false,
        };
        
        // 특수 속성
        enhanced.special = {
            tradeable: !item.name.includes('교환불가'),
            sellable: item.sellPrice > 0,
            expireOnLogout: item.name.includes('로그아웃'),
            accountSharable: item.name.includes('계정'),
        };
        
        // 무기 전용 정보
        if (typeInfo?.category?.includes('Weapon')) {
            enhanced.weapon = {
                attackSpeed: getAttackSpeed(item),
                weaponType: typeInfo.category,
                isTwoHanded: typeInfo.category === 'Two-Handed Weapon',
            };
        }
        
        // 방어구 전용 정보
        if (typeInfo?.category === 'Armor') {
            enhanced.armor = {
                slot: typeInfo.subCategory,
                bodyPart: getBodyPartKorean(typeInfo.subCategory),
            };
        }
        
        // 장신구 전용 정보  
        if (typeInfo?.category === 'Accessory') {
            enhanced.accessory = {
                type: typeInfo.subCategory,
                typeKorean: getAccessoryTypeKorean(typeInfo.subCategory),
            };
        }
    }
    
    return enhanced;
}

// 레벨 기반 스탯 추정 함수
function getEstimatedStats(item) {
    const level = item.level || 0;
    const category = item.category || '';
    
    // 무기 공격력 추정
    let attack = 0;
    let magicAttack = 0;
    
    if (category.includes('Weapon')) {
        // 레벨 기반 공격력 추정
        attack = Math.floor(level * 1.2) + (level >= 10 ? 10 : 0);
        
        if (category.includes('Wand') || category.includes('Staff')) {
            magicAttack = attack;
            attack = Math.floor(attack * 0.3);
        }
    }
    
    // 방어구 방어력 추정
    let defense = 0;
    let magicDefense = 0;
    
    if (category === 'Armor') {
        defense = Math.floor(level * 0.8) + (level >= 20 ? 5 : 0);
        magicDefense = Math.floor(defense * 0.7);
    }
    
    // 명중률/회피율
    const accuracy = level >= 30 ? Math.floor(level * 0.5) : 0;
    const avoidability = level >= 30 ? Math.floor(level * 0.3) : 0;
    
    // 스탯 보너스 추정
    const statBonus = {
        str: category.includes('Weapon') && level >= 20 ? Math.floor(level / 20) : 0,
        dex: category.includes('Bow') && level >= 20 ? Math.floor(level / 20) : 0,
        int: (category.includes('Wand') || category.includes('Staff')) && level >= 20 ? Math.floor(level / 20) : 0,
        luk: category.includes('Claw') && level >= 20 ? Math.floor(level / 20) : 0,
        hp: category === 'Armor' && level >= 15 ? level * 2 : 0,
        mp: (category.includes('Wand') || category.includes('Staff')) && level >= 15 ? level * 2 : 0,
    };
    
    return {
        attack,
        magicAttack,
        defense,
        magicDefense,
        accuracy,
        avoidability,
        statBonus
    };
}

// 요구 스탯 추정
function getRequiredStat(item, statType) {
    const level = item.level || 0;
    const category = item.category || '';
    
    if (level < 10) return 0;
    
    switch (statType) {
        case 'STR':
            return category.includes('Sword') || category.includes('Axe') || category.includes('Blunt') 
                ? level * 4 : 0;
        case 'DEX':
            return category.includes('Bow') || category.includes('Crossbow') 
                ? level * 4 : 0;
        case 'INT':
            return category.includes('Wand') || category.includes('Staff') 
                ? level * 4 : 0;
        case 'LUK':
            return category.includes('Claw') || category.includes('Dagger') 
                ? level * 4 : 0;
        default:
            return 0;
    }
}

// 직업 ID 매핑
function getJobId(jobName) {
    const jobIds = {
        'Beginner': 0,
        'Warrior': 100,
        'Magician': 200,
        'Bowman': 300,
        'Thief': 400,
        'Pirate': 500,
    };
    return jobIds[jobName] || 0;
}

// 업그레이드 슬롯 추정
function getUpgradeSlots(item) {
    const level = item.level || 0;
    if (level < 10) return 0;
    if (level < 30) return 7;
    if (level < 60) return 8;
    return 9;
}

// 공격속도 추정
function getAttackSpeed(item) {
    const category = item.category || '';
    
    if (category.includes('Dagger') || category.includes('Claw')) return 4; // 빠름
    if (category.includes('Sword') || category.includes('Bow')) return 6; // 보통
    if (category.includes('Axe') || category.includes('Blunt')) return 7; // 느림
    if (category.includes('Two-Handed')) return 8; // 매우 느림
    
    return 6; // 기본값
}

// 방어구 부위 한글 변환
function getBodyPartKorean(subCategory) {
    const bodyParts = {
        'Hat': '모자',
        'Overall': '한벌옷',
        'Top': '상의', 
        'Bottom': '하의',
        'Shoes': '신발',
        'Glove': '장갑',
        'Cape': '망토',
        'Shield': '방패',
    };
    return bodyParts[subCategory] || subCategory;
}

// 장신구 종류 한글 변환
function getAccessoryTypeKorean(subCategory) {
    const accessoryTypes = {
        'Face Accessory': '얼굴장식',
        'Eye Decoration': '눈장식',
        'Earrings': '귀걸이',
        'Ring': '반지',
        'Pendant': '펜던트',
        'Belt': '벨트',
        'Medal': '메달',
        'Shoulder Accessory': '어깨장식',
        'Badge': '뱃지',
        'Emblem': '엠블렘',
        'Pocket Item': '포켓 아이템',
    };
    return accessoryTypes[subCategory] || subCategory;
}

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
            // 장비 상세 정보 추출 및 추가
            const enhancedItem = enhanceItemWithStats(item);
            uniqueItems[id] = enhancedItem;
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