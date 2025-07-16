import { useState, useEffect } from 'react';

const STORAGE_KEY = 'maple_item_search_history';
const MAX_HISTORY_SIZE = 10;

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  category?: string;
  count?: number;
}

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  // 로컬 스토리지에서 히스토리 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // 유효한 형식인지 확인
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, MAX_HISTORY_SIZE));
        }
      }
    } catch (error) {
      console.error('검색 히스토리 로드 실패:', error);
      setHistory([]);
    }
  }, []);

  // 히스토리 저장
  const saveHistory = (newHistory: SearchHistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('검색 히스토리 저장 실패:', error);
    }
  };

  // 검색어 추가
  const addSearchQuery = (query: string, category?: string) => {
    if (!query.trim()) return;

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: Date.now(),
      category,
      count: 1
    };

    setHistory(prevHistory => {
      // 기존에 같은 검색어가 있는지 확인
      const existingIndex = prevHistory.findIndex(item => 
        item.query.toLowerCase() === query.toLowerCase().trim()
      );

      let newHistory: SearchHistoryItem[];

      if (existingIndex !== -1) {
        // 기존 항목이 있으면 업데이트하고 맨 앞으로 이동
        const existingItem = prevHistory[existingIndex];
        const updatedItem = {
          ...existingItem,
          timestamp: Date.now(),
          count: (existingItem.count || 1) + 1,
          category: category || existingItem.category
        };
        
        newHistory = [
          updatedItem,
          ...prevHistory.filter((_, index) => index !== existingIndex)
        ];
      } else {
        // 새 항목 추가
        newHistory = [newItem, ...prevHistory];
      }

      // 최대 개수 제한
      const limitedHistory = newHistory.slice(0, MAX_HISTORY_SIZE);
      
      saveHistory(limitedHistory);
      return limitedHistory;
    });
  };

  // 특정 항목 삭제
  const removeSearchQuery = (query: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => 
        item.query.toLowerCase() !== query.toLowerCase()
      );
      saveHistory(newHistory);
      return newHistory;
    });
  };

  // 전체 히스토리 삭제
  const clearHistory = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch (error) {
      console.error('검색 히스토리 삭제 실패:', error);
    }
  };

  // 검색어 제안 (최근 검색어 기반)
  const getSuggestions = (currentQuery: string, limit: number = 5): string[] => {
    if (!currentQuery.trim()) {
      return history.slice(0, limit).map(item => item.query);
    }

    const query = currentQuery.toLowerCase();
    return history
      .filter(item => item.query.toLowerCase().includes(query))
      .slice(0, limit)
      .map(item => item.query);
  };

  return {
    history,
    addSearchQuery,
    removeSearchQuery,
    clearHistory,
    getSuggestions
  };
}