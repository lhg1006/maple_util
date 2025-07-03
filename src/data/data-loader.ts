// 데이터 로더 유틸리티
export async function loadMonsters() {
  const response = await fetch('/data/monsters.json');
  return response.json();
}

export async function loadMaps() {
  const response = await fetch('/data/maps.json');
  return response.json();
}

export async function loadItems() {
  const response = await fetch('/data/items-sample.json');
  return response.json();
}

// 캐시된 데이터
let cachedMonsters: any = null;
let cachedMaps: any = null;
let cachedItems: any = null;

export async function getCachedMonsters() {
  if (!cachedMonsters) {
    cachedMonsters = await loadMonsters();
  }
  return cachedMonsters;
}

export async function getCachedMaps() {
  if (!cachedMaps) {
    cachedMaps = await loadMaps();
  }
  return cachedMaps;
}

export async function getCachedItems() {
  if (!cachedItems) {
    cachedItems = await loadItems();
  }
  return cachedItems;
}
