/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 정적 파일 최적화
  compress: true,
  // 컴파일 경고 억제
  onDemandEntries: {
    // 개발 모드에서 경고 억제
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 빌드 시 경고 억제
  eslint: {
    ignoreDuringBuilds: false, // ESLint는 유지
  },
  typescript: {
    ignoreBuildErrors: false, // TypeScript 에러는 유지
  },
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
  // 존재하지 않는 PWA 아이콘 파일들을 기존 파비콘으로 리다이렉트
  async redirects() {
    return [
      {
        source: '/icon-:size.png',
        destination: '/favicon/android-chrome-192x192.png',
        permanent: true,
      },
      {
        source: '/screenshot-:type.png',
        destination: '/favicon/android-chrome-512x512.png',
        permanent: true,
      },
    ];
  },
  // Webpack 설정으로 Ant Design 경고 억제
  webpack: (config, { dev, isServer, webpack }) => {
    // Ant Design 경고 억제를 위한 webpack DefinePlugin 설정
    config.plugins.push(
      new webpack.DefinePlugin({
        __ANTD_COMPATIBLE_WARN__: JSON.stringify(false),
        __DEV__: JSON.stringify(dev),
      })
    );

    return config;
  },
};

module.exports = nextConfig;