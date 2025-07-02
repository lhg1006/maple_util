// 외부 저장소에서 데이터 로드
// GitHub Gist, CDN, 또는 별도 API 서버 사용

interface DataCache {
  items?: any;
  monsters?: any;
  maps?: any;
}

const cache: DataCache = {};

// GitHub Gist나 CDN URL (예시)
const DATA_URLS = {
  // 이 URL들은 실제 데이터를 호스팅하는 곳으로 변경해야 합니다
  // 옵션 1: GitHub Gist
  // items: 'https://gist.githubusercontent.com/username/gistid/raw/items.json',
  
  // 옵션 2: GitHub Pages (별도 레포지토리)
  // items: 'https://username.github.io/maple-data/items.json',
  
  // 옵션 3: 무료 CDN (jsDelivr + GitHub)
  // items: 'https://cdn.jsdelivr.net/gh/username/repo@main/data/items.json',
  
  // 임시로 API 직접 사용
  items: '/api/data/items',
  monsters: '/api/data/monsters',
  maps: '/api/data/maps'
};

export async function loadCompleteItems() {
  if (cache.items) return cache.items;
  
  try {
    const response = await fetch(DATA_URLS.items);
    const data = await response.json();
    cache.items = data;
    return data;
  } catch (error) {
    console.error('Failed to load items data:', error);
    return {};
  }
}

export async function loadCompleteMonsters() {
  if (cache.monsters) return cache.monsters;
  
  try {
    const response = await fetch(DATA_URLS.monsters);
    const data = await response.json();
    cache.monsters = data;
    return data;
  } catch (error) {
    console.error('Failed to load monsters data:', error);
    return {};
  }
}

export async function loadCompleteMaps() {
  if (cache.maps) return cache.maps;
  
  try {
    const response = await fetch(DATA_URLS.maps);
    const data = await response.json();
    cache.maps = data;
    return data;
  } catch (error) {
    console.error('Failed to load maps data:', error);
    return {};
  }
}

// 초기 로드 (프리로딩)
export async function preloadAllData() {
  await Promise.all([
    loadCompleteItems(),
    loadCompleteMonsters(),
    loadCompleteMaps()
  ]);
}