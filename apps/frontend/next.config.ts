import type { NextConfig } from 'next';

function resolveBackendUrl(): string {
  const raw = process.env.BACKEND_URL?.trim();
  if (!raw) {
    return 'http://localhost:3001';
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'http://localhost:3001';
    }
    return parsed.origin;
  } catch {
    return 'http://localhost:3001';
  }
}

const backendUrl = resolveBackendUrl();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@draft-io/shared-types', '@draft-io/shared-utils'],
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
