import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable CSS Modules with TypeScript support
  // CSS Modules are enabled by default in Next.js, this just documents the configuration

  // Optimize for production
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 375, 768, 1200, 1920],
  },

  // Performance optimizations
  reactStrictMode: true,

  // Environment variables (if needed)
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  },
};

export default nextConfig;
