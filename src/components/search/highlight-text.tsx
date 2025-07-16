'use client';

import React from 'react';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
  highlightStyle?: React.CSSProperties;
}

export function HighlightText({ 
  text, 
  query, 
  className,
  highlightStyle = {
    backgroundColor: '#fffbe6',
    color: '#d48806',
    fontWeight: 'bold',
    padding: '0 2px',
    borderRadius: '2px'
  }
}: HighlightTextProps) {
  if (!query.trim()) {
    return <span className={className}>{text}</span>;
  }
  
  // 특수 문자 이스케이프
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <span className={className}>
      {parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} style={highlightStyle}>
            {part}
          </span>
        ) : (
          part
        )
      )}
    </span>
  );
}