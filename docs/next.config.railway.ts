import type { NextConfig } from "next";

// Railway-specific configuration with standalone output
const nextConfig: NextConfig = {
  // Output configuration for Railway (standalone mode for smaller deployments)
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'leaflet', 'react-leaflet'],
  },
  productionBrowserSourceMaps: false,
  compress: true,
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
      loader: 'ignore-loader',
    });
    
    return config;
  },
};

export default nextConfig;
