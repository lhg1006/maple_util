// CDN에서 데이터 로드
const CDN_BASE_URL = 'https://cdn.jsdelivr.net/gh/lhg1006/maple-util-data@latest';

// 로컬 개발시 public 폴더 사용 (옵션)
const USE_LOCAL = process.env.NODE_ENV === 'development' && false;
const LOCAL_BASE_URL = '/data-cdn';

const BASE_URL = USE_LOCAL ? LOCAL_BASE_URL : CDN_BASE_URL;

interface ItemsIndex {
  totalItems: number;
  chunks: Array<{
    file: string;
    count: number;
    range: string;
  }>;
  generated: string;
}

// 캐시
const cache = {
  items: null as any,
  monsters: null as any,
  maps: null as any,
  itemsLoading: false,
  monstersLoading: false,
  mapsLoading: false
};

// 몬스터 데이터 로드
export async function loadMonsters(): Promise<Record<number, any>> {
  if (cache.monsters) return cache.monsters;
  if (cache.monstersLoading) {
    // 이미 로딩 중이면 완료될 때까지 대기
    while (cache.monstersLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return cache.monsters;
  }

  cache.monstersLoading = true;
  try {
    console.log('📥 몬스터 데이터 로딩 중...');
    const response = await fetch(`${BASE_URL}/monsters.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    cache.monsters = data;
    console.log(`✅ ${Object.keys(data).length}개 몬스터 로드 완료`);
    return data;
  } catch (error) {
    console.error('몬스터 데이터 로드 실패:', error);
    return {};
  } finally {
    cache.monstersLoading = false;
  }
}

// 맵 데이터 로드
export async function loadMaps(): Promise<Record<number, any>> {
  if (cache.maps) return cache.maps;
  if (cache.mapsLoading) {
    while (cache.mapsLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return cache.maps;
  }

  cache.mapsLoading = true;
  try {
    console.log('📥 맵 데이터 로딩 중...');
    const response = await fetch(`${BASE_URL}/maps.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    cache.maps = data;
    console.log(`✅ ${Object.keys(data).length}개 맵 로드 완료`);
    return data;
  } catch (error) {
    console.error('맵 데이터 로드 실패:', error);
    return {};
  } finally {
    cache.mapsLoading = false;
  }
}

// 아이템 데이터 로드 (청크 단위)
export async function loadItems(): Promise<Record<number, any>> {
  if (cache.items) return cache.items;
  if (cache.itemsLoading) {
    while (cache.itemsLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return cache.items;
  }

  cache.itemsLoading = true;
  try {
    console.log('📥 아이템 데이터 로딩 중...');
    
    // 먼저 인덱스 파일 로드 (캐시 버스팅)
    const indexResponse = await fetch(`${BASE_URL}/items-index.json?t=${Date.now()}`);
    if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
    
    const index: ItemsIndex = await indexResponse.json();
    console.log(`📋 ${index.totalItems}개 아이템, ${index.chunks.length}개 청크`);
    
    // 모든 청크를 병렬로 로드 (캐시 버스팅)
    const chunkPromises = index.chunks.map(async (chunk, i) => {
      console.log(`  📦 청크 ${i + 1}/${index.chunks.length} 로딩...`);
      const response = await fetch(`${BASE_URL}/${chunk.file}?t=${Date.now()}`);
      if (!response.ok) throw new Error(`청크 로드 실패: ${chunk.file}`);
      return response.json();
    });
    
    const chunks = await Promise.all(chunkPromises);
    
    // 모든 청크를 하나로 병합
    const allItems = chunks.reduce((acc, chunk) => {
      return { ...acc, ...chunk };
    }, {});
    
    cache.items = allItems;
    console.log(`✅ ${Object.keys(allItems).length}개 아이템 로드 완료`);
    return allItems;
  } catch (error) {
    console.error('아이템 데이터 로드 실패:', error);
    return {};
  } finally {
    cache.itemsLoading = false;
  }
}

// 모든 데이터 프리로드
export async function preloadAllData() {
  console.log('🚀 전체 데이터 프리로딩 시작...');
  const start = Date.now();
  
  await Promise.all([
    loadMonsters(),
    loadMaps(),
    loadItems()
  ]);
  
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`✨ 전체 데이터 로드 완료 (${elapsed}초)`);
}

// 데이터 캐시 클리어
export function clearCache() {
  cache.items = null;
  cache.monsters = null;
  cache.maps = null;
  console.log('🗑️ 데이터 캐시 클리어됨');
}