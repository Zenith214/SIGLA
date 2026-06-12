import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Disable linting during build - use CLI for linting
  // eslint config moved to .eslintrc or eslint.config.mjs
  
  // Skip static optimization for auth-dependent pages during build
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', 'recharts', 'leaflet', 'react-leaflet'],
  },
  
  // Force all pages to be dynamically rendered to prevent prerender errors
  output: 'standalone',
  
  // Generate build ID to avoid stale cache
  generateBuildId: async () => {
    return `build-${Date.now()}`;
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
  // Production optimizations
  productionBrowserSourceMaps: false,
  // Compress responses
  compress: true,
};

export default nextConfig;
