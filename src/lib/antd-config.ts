// Ant Design 설정 및 경고 억제

// React 19 경고 억제
if (typeof window !== 'undefined') {
  // 브라우저 환경에서만 실행
  const originalWarn = console.warn;
  console.warn = (...args) => {
    // Ant Design React 호환성 경고 필터링
    if (args[0]?.includes?.('antd v5 support React is 16 ~ 18')) {
      return;
    }
    if (args[0]?.includes?.('compatible')) {
      return;
    }
    originalWarn(...args);
  };
}

// Ant Design 기본 설정
export const antdConfig = {
  theme: {
    token: {
      // 기본 테마 설정
      colorPrimary: '#1890ff',
      borderRadius: 6,
    },
  },
  // 경고 억제 설정
  warning: {
    strict: false,
  },
};