'use client';

import React, { useState } from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface ImageWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  showSpinner?: boolean;
}

export function ImageWithFallback({ 
  src, 
  alt, 
  className, 
  style,
  fallbackSrc = '/placeholder-item.png',
  showSpinner = true
}: ImageWithFallbackProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(true);
    e.currentTarget.src = fallbackSrc;
  };

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* 로딩 스피너 */}
      {isLoading && showSpinner && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1
        }}>
          <Spin 
            indicator={<LoadingOutlined style={{ fontSize: 16, color: '#999' }} spin />} 
            size="small"
          />
        </div>
      )}
      
      {/* 이미지 */}
      <img 
        src={src}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{
          opacity: isLoading ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
          ...style
        }}
      />
      
      {/* 에러 상태 표시 */}
      {hasError && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          background: 'rgba(255, 0, 0, 0.7)',
          color: 'white',
          fontSize: '10px',
          padding: '2px 4px',
          borderRadius: '2px'
        }}>
          !
        </div>
      )}
    </div>
  );
}