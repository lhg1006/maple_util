// maplestory.io API에서 실제 아이템 스탯 데이터를 가져오는 함수
import { MapleItem, ItemRequirements, ItemCombatStats, ItemStatBonus } from '@/types/maplestory';

interface MapleAPIResponse {
  id?: number;
  description?: {
    id: number;
    name: string;
    description: string;
  };
  metaInfo?: {
    reqLevel?: number;
    reqLevelEquip?: number;
    reqSTR?: number;
    reqDEX?: number;
    reqINT?: number;
    reqLUK?: number;
    reqJob?: number;
    incSTR?: number;
    incDEX?: number;
    incINT?: number;
    incLUK?: number;
    incHP?: number;
    incMP?: number;
    incPAD?: number;
    incMAD?: number;
    incPDD?: number;
    incMDD?: number;
    incACC?: number;
    incEVA?: number;
    incSpeed?: number;
    incJump?: number;
    tuc?: number;
    attackSpeed?: number;
    cash?: boolean;
    price?: number;
  };
}

// API에서 아이템 스탯 데이터 가져오기
export async function fetchItemStats(itemId: number): Promise<{
  requirements?: ItemRequirements;
  combat?: ItemCombatStats;
  stats?: ItemStatBonus;
  enhancement?: { upgradeSlots: number; attackSpeed: number; isUnique: boolean; isCash: boolean; };
  weapon?: { weaponType: string; attackSpeed: number; isTwoHanded: boolean; };
} | null> {
  try {
    console.log(`🔍 API 호출 시작: item ${itemId}`);
    
    // KMS/389 버전에서만 호출
    console.log(`🔄 KMS/389 버전으로 시도 중... item ${itemId}`);
    const response = await fetch(`https://maplestory.io/api/KMS/389/item/${itemId}`);
    
    if (!response.ok) {
      console.log(`❌ KMS/389 실패: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    console.log(`✅ KMS/389에서 성공! item ${itemId}`, { hasData: !!data, dataKeys: data ? Object.keys(data) : [] });
    
    if (!data) {
      console.log(`❌ KMS/389에서 데이터 없음: item ${itemId}`);
      return null;
    }
    
    console.log(`📦 API 응답 받음 for item ${itemId} (KMS/389):`, { 
      hasData: !!data, 
      hasMetaInfo: !!data?.metaInfo,
      keys: data ? Object.keys(data) : [],
      fullData: data // 전체 응답 구조 확인
    });
    
    // API 응답 구조 확인
    if (!data) {
      console.log(`❌ 빈 응답 데이터 for item ${itemId}`);
      return null;
    }
    
    const meta = data.metaInfo;
    
    if (!meta) {
      console.log(`ℹ️ metaInfo가 없음 for item ${itemId}. 전체 응답:`, JSON.stringify(data, null, 2));
      // metaInfo가 없는 경우에도 description이 있다면 기본 정보라도 제공
      if (data.description) {
        console.log(`📝 description만 있는 아이템 ${itemId}: ${data.description.name}`);
      }
      
      // 일부 아이템은 metaInfo가 없을 수 있음 (장비가 아닌 아이템들)
      // 이런 경우 빈 객체가 아닌 null을 반환하여 "정보 없음"으로 처리
      return null;
    }
    
    const result: any = {};
    
    // 요구 조건
    if (meta.reqLevelEquip || meta.reqLevel || meta.reqSTR || meta.reqDEX || meta.reqINT || meta.reqLUK) {
      result.requirements = {
        level: meta.reqLevelEquip || meta.reqLevel || 0,
        str: meta.reqSTR || 0,
        dex: meta.reqDEX || 0,
        int: meta.reqINT || 0,
        luk: meta.reqLUK || 0,
        job: meta.reqJob || 0,
      };
    }
    
    // 전투 스탯
    if (meta.incPAD || meta.incMAD || meta.incPDD || meta.incMDD || meta.incACC || meta.incEVA || meta.bdR || meta.imdR) {
      result.combat = {
        attack: meta.incPAD || 0,
        magicAttack: meta.incMAD || 0,
        defense: meta.incPDD || 0,
        magicDefense: meta.incMDD || 0,
        accuracy: meta.incACC || 0,
        avoidability: meta.incEVA || 0,
        speed: meta.incSpeed || 0,
        jump: meta.incJump || 0,
        bossDamage: meta.bdR || 0,
        ignoreDefense: meta.imdR || 0,
      };
    }
    
    // 스탯 증가
    if (meta.incSTR || meta.incDEX || meta.incINT || meta.incLUK || meta.incHP || meta.incMP) {
      result.stats = {
        str: meta.incSTR || 0,
        dex: meta.incDEX || 0,
        int: meta.incINT || 0,
        luk: meta.incLUK || 0,
        hp: meta.incHP || 0,
        mp: meta.incMP || 0,
      };
    }
    
    // 무기 정보 감지 (공격력이 있거나 무기 카테고리인 경우)
    const hasWeaponStats = meta.incPAD > 0 || meta.incMAD > 0;
    const isWeaponCategory = data.description?.name && (
      data.description.name.toLowerCase().includes('weapon') ||
      data.description.name.toLowerCase().includes('sword') ||
      data.description.name.toLowerCase().includes('axe') ||
      data.description.name.toLowerCase().includes('bow') ||
      data.description.name.toLowerCase().includes('staff') ||
      data.description.name.toLowerCase().includes('wand') ||
      data.description.name.toLowerCase().includes('dagger') ||
      data.description.name.toLowerCase().includes('claw') ||
      data.description.name.toLowerCase().includes('gun') ||
      data.description.name.toLowerCase().includes('knuckle')
    );
    
    if (hasWeaponStats || isWeaponCategory) {
      console.log(`🗡️ 무기 정보 감지 for item ${itemId}:`, {
        name: data.description?.name,
        incPAD: meta.incPAD,
        incMAD: meta.incMAD,
        attackSpeed: meta.attackSpeed,
        hasWeaponStats,
        isWeaponCategory
      });
      
      const itemName = data.description?.name || '';
      let weaponType = 'Unknown';
      
      // 무기 타입 감지 로직 개선
      const nameLower = itemName.toLowerCase();
      if (nameLower.includes('sword') || nameLower.includes('검')) weaponType = 'Sword';
      else if (nameLower.includes('axe') || nameLower.includes('도끼')) weaponType = 'Axe';
      else if (nameLower.includes('bow') || nameLower.includes('활')) weaponType = 'Bow';
      else if (nameLower.includes('staff') || nameLower.includes('스태프')) weaponType = 'Staff';
      else if (nameLower.includes('wand') || nameLower.includes('완드')) weaponType = 'Wand';
      else if (nameLower.includes('dagger') || nameLower.includes('단검')) weaponType = 'Dagger';
      else if (nameLower.includes('claw') || nameLower.includes('아대')) weaponType = 'Claw';
      else if (nameLower.includes('gun') || nameLower.includes('총')) weaponType = 'Gun';
      else if (nameLower.includes('knuckle') || nameLower.includes('너클')) weaponType = 'Knuckle';
      else if (nameLower.includes('mace') || nameLower.includes('둔기')) weaponType = 'Mace';
      else if (nameLower.includes('spear') || nameLower.includes('창')) weaponType = 'Spear';
      else if (nameLower.includes('pole') || nameLower.includes('폴암')) weaponType = 'Polearm';
      else if (nameLower.includes('weapon')) weaponType = 'Weapon';
      else weaponType = itemName; // 기본적으로 아이템 이름 사용
                        
      result.weapon = {
        weaponType: weaponType,
        attackSpeed: meta.attackSpeed || 0,
        isTwoHanded: nameLower.includes('two-handed') || nameLower.includes('양손') || false
      };
    }
    
    // 강화 정보
    if (meta.tuc || meta.attackSpeed) {
      result.enhancement = {
        upgradeSlots: meta.tuc || 0,
        attackSpeed: meta.attackSpeed || 0,
        isUnique: false,
        isCash: meta.cash || false,
      };
    }
    
    return Object.keys(result).length > 0 ? result : null;
  } catch (error) {
    console.error(`❌ 아이템 ${itemId} 스탯 조회 중 에러 발생:`, {
      error: error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return null;
  }
}

// 여러 아이템의 스탯을 배치로 가져오기 (API 호출 제한 고려)
export async function fetchMultipleItemStats(itemIds: number[]): Promise<Record<number, any>> {
  const results: Record<number, any> = {};
  
  // API 호출 제한을 위해 배치 처리
  for (let i = 0; i < itemIds.length; i += 5) {
    const batch = itemIds.slice(i, i + 5);
    const batchPromises = batch.map(async (id) => {
      const stats = await fetchItemStats(id);
      if (stats) {
        results[id] = stats;
      }
      // API 호출 간격 조절
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    await Promise.all(batchPromises);
  }
  
  return results;
}

// 아이템에 실제 스탯 정보 병합
export function mergeItemWithStats(item: MapleItem, stats: any): MapleItem {
  return {
    ...item,
    requirements: stats.requirements || item.requirements,
    combat: stats.combat || item.combat,
    stats: stats.stats || item.stats,
    enhancement: stats.enhancement || item.enhancement,
    _hasValidStats: Boolean(
      stats.requirements?.level > 0 ||
      stats.combat?.attack > 0 ||
      stats.stats?.str > 0
    ),
  };
}