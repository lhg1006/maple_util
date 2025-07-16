/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
};

module.exports = nextConfig;