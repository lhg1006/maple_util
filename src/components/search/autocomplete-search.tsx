'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input, List, Spin, Button, Divider } from 'antd';
import { SearchOutlined, LoadingOutlined, HistoryOutlined, DeleteOutlined } from '@ant-design/icons';
import { useItemAutocomplete, AutocompleteItem } from '@/hooks/use-item-autocomplete';
import { useSearchHistory } from '@/hooks/use-search-history';
import { ImageWithFallback } from '@/components/common/image-with-fallback';

const { Search } = Input;

interface AutocompleteSearchProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  overallCategory: string;
  category: string;
  subCategory: string;
  enabled?: boolean;
  size?: 'small' | 'middle' | 'large';
}

export function AutocompleteSearch({
  placeholder = "아이템 이름을 검색하세요",
  value,
  onChange,
  onSearch,
  onKeyPress,
  overallCategory,
  category,
  subCategory,
  enabled = true,
  size = 'large'
}: AutocompleteSearchProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 자동완성 데이터
  const { suggestions, isLoading: isAutocompleteLoading } = useItemAutocomplete(
    value,
    overallCategory,
    category,
    subCategory,
    enabled && inputFocused
  );

  // 검색 히스토리
  const { history, addSearchQuery, removeSearchQuery, getSuggestions } = useSearchHistory();

  // 히스토리 제안
  const historySuggestions = getSuggestions(value, 3);
  
  // 드롭다운 표시 조건
  const shouldShowDropdown = showDropdown && inputFocused && (
    (value.trim().length >= 2 && suggestions.length > 0) ||
    (value.trim().length === 0 && historySuggestions.length > 0)
  );

  // 입력값 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.trim().length >= 2) {
      setShowDropdown(true);
      setSelectedIndex(-1);
    } else {
      setShowDropdown(false);
    }
  };

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!shouldShowDropdown) {
      if (onKeyPress) onKeyPress(e);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const maxIndex = historySuggestions.length + suggestions.length - 1;
        setSelectedIndex(prev => 
          prev < maxIndex ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < historySuggestions.length) {
            // 히스토리 항목 선택
            const selectedQuery = historySuggestions[selectedIndex];
            handleHistoryClick(selectedQuery);
          } else {
            // 자동완성 항목 선택
            const suggestionIndex = selectedIndex - historySuggestions.length;
            if (suggestionIndex < suggestions.length) {
              const selectedItem = suggestions[suggestionIndex];
              handleSuggestionClick(selectedItem);
            }
          }
        } else {
          handleSearchClick();
        }
        break;
      
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      
      default:
        if (onKeyPress) onKeyPress(e);
        break;
    }
  };

  // 추천 아이템 클릭
  const handleSuggestionClick = (item: AutocompleteItem) => {
    onChange(item.name);
    addSearchQuery(item.name, `${category} > ${subCategory}`);
    onSearch(item.name);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // 히스토리 항목 클릭
  const handleHistoryClick = (query: string) => {
    onChange(query);
    addSearchQuery(query, `${category} > ${subCategory}`);
    onSearch(query);
    setShowDropdown(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // 포커스 관리
  const handleFocus = () => {
    setInputFocused(true);
    if (value.trim().length >= 2 && suggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // 드롭다운 클릭을 위해 약간의 딜레이 추가
    setTimeout(() => {
      setInputFocused(false);
      setShowDropdown(false);
      setSelectedIndex(-1);
    }, 200);
  };

  // 검색 버튼 클릭
  const handleSearchClick = () => {
    if (value.trim()) {
      addSearchQuery(value.trim(), `${category} > ${subCategory}`);
    }
    onSearch(value);
    setShowDropdown(false);
    setSelectedIndex(-1);
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.input.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Search
        ref={inputRef}
        placeholder={placeholder}
        allowClear
        enterButton={<SearchOutlined />}
        size={size}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSearch={handleSearchClick}
        suffix={
          isAutocompleteLoading && value.trim().length >= 2 ? (
            <LoadingOutlined style={{ color: '#1890ff' }} />
          ) : undefined
        }
      />
      
      {/* 자동완성 드롭다운 */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: '#ffffff',
            border: '1px solid #d9d9d9',
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            maxHeight: '300px',
            overflow: 'auto'
          }}
        >
          {/* 검색 히스토리 (검색어가 없을 때) */}
          {value.trim().length === 0 && historySuggestions.length > 0 && (
            <>
              <div style={{ 
                padding: '8px 12px', 
                fontSize: '12px', 
                color: '#666', 
                backgroundColor: '#fafafa',
                borderBottom: '1px solid #f0f0f0',
                fontWeight: '500'
              }}>
                <HistoryOutlined style={{ marginRight: '4px' }} />
                최근 검색어
              </div>
              <List
                size="small"
                dataSource={historySuggestions}
                renderItem={(query, index) => (
                  <List.Item
                    key={query}
                    onClick={() => handleHistoryClick(query)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: selectedIndex === index ? '#f0f8ff' : 'transparent',
                      borderBottom: index < historySuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span style={{ fontSize: '14px' }}>{query}</span>
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSearchQuery(query);
                      }}
                      style={{ 
                        opacity: 0.5,
                        fontSize: '12px',
                        padding: '0 4px'
                      }}
                    />
                  </List.Item>
                )}
              />
            </>
          )}

          {/* 자동완성 아이템 (검색어가 있을 때) */}
          {value.trim().length >= 2 && suggestions.length > 0 && (
            <>
              {historySuggestions.length > 0 && <Divider style={{ margin: 0 }} />}
              <List
                size="small"
                dataSource={suggestions}
                renderItem={(item, index) => (
                  <List.Item
                    key={item.id}
                    onClick={() => handleSuggestionClick(item)}
                    style={{
                      padding: '8px 12px',
                      cursor: 'pointer',
                      backgroundColor: selectedIndex === (historySuggestions.length + index) ? '#f0f8ff' : 'transparent',
                      borderBottom: index < suggestions.length - 1 ? '1px solid #f0f0f0' : 'none'
                    }}
                    onMouseEnter={() => setSelectedIndex(historySuggestions.length + index)}
                  >
                    <List.Item.Meta
                      avatar={
                        <ImageWithFallback
                          src={item.icon}
                          alt={item.name}
                          style={{ width: 24, height: 24 }}
                          fallbackSrc="/placeholder-item.png"
                        />
                      }
                      title={
                        <div style={{ fontSize: '14px', fontWeight: '500' }}>
                          {highlightMatch(item.name, value)}
                        </div>
                      }
                      description={
                        <span style={{ fontSize: '12px', color: '#666' }}>
                          {item.category}
                          {item.subCategory && ` > ${item.subCategory}`}
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            </>
          )}
          
          {/* 로딩 상태 */}
          {isAutocompleteLoading && (
            <div style={{ 
              padding: '12px', 
              textAlign: 'center', 
              borderTop: '1px solid #f0f0f0' 
            }}>
              <Spin size="small" /> 
              <span style={{ marginLeft: '8px', fontSize: '12px', color: '#666' }}>
                검색 중...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 검색어 하이라이트 함수
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? (
      <span key={index} style={{ backgroundColor: '#fffbe6', color: '#d48806', fontWeight: 'bold' }}>
        {part}
      </span>
    ) : (
      part
    )
  );
}