// Ant Design 설정 및 경고 억제

// React 19 경고 억제 (클라이언트와 서버 모두)
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  // Ant Design React 호환성 경고 필터링
  const message = args[0];
  if (typeof message === 'string') {
    if (message.includes('antd v5 support React is 16 ~ 18') ||
        message.includes('antd: compatible') ||
        message.includes('see https://u.ant.design/v5-for-19') ||
        message.includes('[antd: compatible]')) {
      return; // 경고 무시
    }
  }
  originalWarn(...args);
};

console.error = (...args) => {
  // Ant Design React 호환성 에러 필터링
  const message = args[0];
  if (typeof message === 'string') {
    if (message.includes('antd v5 support React is 16 ~ 18') ||
        message.includes('antd: compatible') ||
        message.includes('see https://u.ant.design/v5-for-19') ||
        message.includes('[antd: compatible]')) {
      return; // 에러 무시
    }
  }
  originalError(...args);
};

// 브라우저 환경에서 추가 설정
if (typeof window !== 'undefined') {
  // 전역 경고 억제
  window.addEventListener('error', (e) => {
    if (e.message?.includes('antd v5 support React')) {
      e.preventDefault();
      return false;
    }
  });
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