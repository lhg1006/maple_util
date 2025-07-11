/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // React 19와 Ant Design 5 호환성 경고 억제
    serverComponentsExternalPackages: ['antd'],
  },
  // 콘솔 경고 필터링
  onWarning: (warning) => {
    if (warning.code === 'ANTD_COMPATIBLE_WARNING') {
      return;
    }
    console.warn(warning);
  },
  // 정적 파일 최적화
  compress: true,
  // 이미지 최적화 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maplestory.io',
        pathname: '/api/**',
      },
    ],
  },
  // PWA 지원을 위한 헤더 설정
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;