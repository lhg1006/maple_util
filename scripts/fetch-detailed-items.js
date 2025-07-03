const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// maplestory.io API에서 상세 아이템 정보 가져오기
async function fetchDetailedItems() {
    const outputDir = path.join(__dirname, '../data-cdn-clean');
    
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    console.log('🔍 API에서 상세 아이템 정보 가져오기 시작...\n');
    
    // 기존 아이템 인덱스 읽기
    const indexPath = path.join(outputDir, 'items-index.json');
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    console.log(`📋 ${index.totalItems}개 아이템, ${index.chunks.length}개 청크 발견`);
    
    let processedCount = 0;
    let enhancedCount = 0;
    
    // 각 청크 파일 처리 (장비 아이템이 있는 청크만 선택)
    for (let i = 0; i < Math.min(index.chunks.length, 2); i++) { // 처음 2개 청크만
        const chunk = index.chunks[i];
        const chunkPath = path.join(outputDir, chunk.file);
        
        console.log(`\n📦 ${chunk.file} 처리 중... (${chunk.count}개 아이템)`);
        
        const chunkData = JSON.parse(fs.readFileSync(chunkPath, 'utf8'));
        const enhancedChunkData = {};
        
        // 청크 내 각 아이템 처리 (장비만 필터링)
        const equipmentItems = Object.entries(chunkData).filter(([itemId, item]) => {
            const typeInfo = item.originalData?.typeInfo || item.typeInfo;
            return typeInfo?.overallCategory === 'Equip';
        });
        
        console.log(`  🎯 장비 아이템: ${equipmentItems.length}개 발견`);
        
        for (const [itemId, item] of equipmentItems) {
            processedCount++;
            
            try {
                console.log(`  🔄 아이템 ${itemId} (${item.name}) API 호출 중...`);
                
                const detailedItem = await fetchItemFromAPI(itemId);
                if (detailedItem) {
                    enhancedChunkData[itemId] = {
                        ...item,
                        ...enhanceWithAPIData(item, detailedItem)
                    };
                    enhancedCount++;
                    console.log(`  ✅ ${item.name} 상세 정보 추가`);
                } else {
                    enhancedChunkData[itemId] = item;
                    console.log(`  ⚠️ ${item.name} API 응답 없음`);
                }
                
                // API 레이트 리미트 방지 (더 짧게)
                await sleep(100);
                
            } catch (error) {
                console.log(`  ❌ ${item.name} API 오류: ${error.message}`);
                enhancedChunkData[itemId] = item;
            }
            
            // 진행상황 표시
            if (processedCount % 10 === 0) {
                console.log(`  📊 진행률: ${processedCount}/${equipmentItems.length} (${Math.round(processedCount/equipmentItems.length*100)}%)`);
            }
        }
        
        // 장비가 아닌 아이템들도 추가
        for (const [itemId, item] of Object.entries(chunkData)) {
            if (!enhancedChunkData[itemId]) {
                enhancedChunkData[itemId] = item;
            }
        }
        
        // 향상된 청크 데이터 저장
        fs.writeFileSync(chunkPath, JSON.stringify(enhancedChunkData));
        console.log(`✅ ${chunk.file} 완료 - ${enhancedCount}개 아이템 향상됨`);
    }
    
    console.log(`\n🎉 완료!`);
    console.log(`📊 처리된 아이템: ${processedCount}개`);
    console.log(`✨ 향상된 아이템: ${enhancedCount}개`);
}

// maplestory.io API에서 개별 아이템 정보 가져오기
async function fetchItemFromAPI(itemId) {
    try {
        const url = `https://maplestory.io/api/KMS/389/item/${itemId}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API 요청 실패 (${itemId}):`, error.message);
        return null;
    }
}

// API 데이터로 아이템 정보 향상
function enhanceWithAPIData(originalItem, apiData) {
    const enhanced = {};
    
    try {
        const metaInfo = apiData.metaInfo || {};
        const typeInfo = apiData.typeInfo || originalItem.originalData?.typeInfo;
        
        // 요구 조건
        enhanced.requirements = {
            level: metaInfo.reqLevel || 0,
            str: metaInfo.reqSTR || 0,
            dex: metaInfo.reqDEX || 0,
            int: metaInfo.reqINT || 0,
            luk: metaInfo.reqLUK || 0,
            job: metaInfo.reqJob || 0,
        };
        
        // 공격/방어 스탯
        enhanced.combat = {
            attack: metaInfo.incPAD || 0,
            magicAttack: metaInfo.incMAD || 0,
            defense: metaInfo.incPDD || 0,
            magicDefense: metaInfo.incMDD || 0,
            accuracy: metaInfo.incACC || 0,
            avoidability: metaInfo.incEVA || 0,
            speed: metaInfo.incSpeed || 0,
            jump: metaInfo.incJump || 0,
        };
        
        // 스탯 증가
        enhanced.stats = {
            str: metaInfo.incSTR || 0,
            dex: metaInfo.incDEX || 0,
            int: metaInfo.incINT || 0,
            luk: metaInfo.incLUK || 0,
            hp: metaInfo.incHP || 0,
            mp: metaInfo.incMP || 0,
        };
        
        // 강화 정보
        enhanced.enhancement = {
            upgradeSlots: metaInfo.tuc || 0,
            attackSpeed: metaInfo.attackSpeed || 0,
            isUnique: metaInfo.only === 1,
            isCash: metaInfo.cash === 1,
        };
        
        // 특수 속성
        enhanced.special = {
            tradeable: metaInfo.tradeBlock !== 1,
            sellable: metaInfo.notSale !== 1,
            expireOnLogout: metaInfo.expireOnLogout === 1,
            accountSharable: metaInfo.accountSharable === 1,
        };
        
        // 무기 전용 정보
        if (typeInfo?.category?.includes('Weapon')) {
            enhanced.weapon = {
                attackSpeed: metaInfo.attackSpeed || 0,
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
        
        // 셋 아이템 정보
        if (metaInfo.setCompleteCount) {
            enhanced.setInfo = {
                setId: metaInfo.setItemID || 0,
                setName: metaInfo.setItemName || '',
                completeCount: metaInfo.setCompleteCount,
            };
        }
        
    } catch (error) {
        console.error(`데이터 향상 실패:`, error.message);
    }
    
    return enhanced;
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

// 슬립 함수
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 실행
fetchDetailedItems().catch(console.error);