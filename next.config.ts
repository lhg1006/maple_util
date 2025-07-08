import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maplestory.io',
        port: '',
        pathname: '/api/**',
      },
    ],
  },
};

export default nextConfig;
