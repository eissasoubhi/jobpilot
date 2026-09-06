import type { NextConfig } from 'next';

const apiInternalUrl =
  process.env.API_INTERNAL_URL ?? 'http://api:8080';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiInternalUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
