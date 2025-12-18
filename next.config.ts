import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
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
    // Enable image optimization
    formats: ['image/webp', 'image/avif'],
    // Minimize layout shift
    minimumCacheTTL: 60,
  },
  // Performance optimizations
  compiler: {
    // Keep console logs for debugging authentication issues
    // TODO: Re-enable console removal after fixing login issues
    removeConsole: false,
  },
  // Optimize bundle
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', 'recharts', 'leaflet', 'react-leaflet'],
  },
  // Production optimizations
  productionBrowserSourceMaps: false,
  // Compress responses
  compress: true,
  // Empty turbopack config to silence warnings in Next.js 16
  turbopack: {},
};

export default nextConfig;
