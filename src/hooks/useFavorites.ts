import { useState, useEffect, useCallback } from 'react';

export interface FavoriteItem {
  id: number;
  type: 'item' | 'npc' | 'mob' | 'job' | 'skill';
  name: string;
  icon?: string;
  addedAt: string;
  // 추가 메타정보
  meta?: {
    level?: number;
    location?: string;
    category?: string;
    description?: string;
    [key: string]: string | number | boolean | null | undefined;
  };
}

const FAVORITES_KEY = 'maple_util_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  // 즐겨찾기 목록 로드
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      }
    } catch (error) {
      console.warn('Failed to load favorites:', error);
      setFavorites([]);
    }
  }, []);

  // localStorage에 저장
  const saveFavorites = useCallback((newFavorites: FavoriteItem[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.warn('Failed to save favorites:', error);
    }
  }, []);

  // 즐겨찾기 추가
  const addFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    const newItem: FavoriteItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    
    const newFavorites = [newItem, ...favorites.filter(fav => 
      !(fav.id === item.id && fav.type === item.type)
    )];
    
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  // 즐겨찾기 제거
  const removeFavorite = useCallback((id: number, type: string) => {
    const newFavorites = favorites.filter(fav => 
      !(fav.id === id && fav.type === type)
    );
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  // 즐겨찾기 여부 확인
  const isFavorite = useCallback((id: number, type: string) => {
    return favorites.some(fav => fav.id === id && fav.type === type);
  }, [favorites]);

  // 즐겨찾기 토글
  const toggleFavorite = useCallback((item: Omit<FavoriteItem, 'addedAt'>) => {
    if (isFavorite(item.id, item.type)) {
      removeFavorite(item.id, item.type);
    } else {
      addFavorite(item);
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // 타입별 즐겨찾기 가져오기
  const getFavoritesByType = useCallback((type: string) => {
    return favorites.filter(fav => fav.type === type);
  }, [favorites]);

  // 전체 초기화
  const clearAllFavorites = useCallback(() => {
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    toggleFavorite,
    getFavoritesByType,
    clearAllFavorites,
  };
}