import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * Configured for Hugging Face Space deployment
 */

// Hugging Face Space URL derivation
function getHuggingFaceApiUrl(): string {
  const owner = process.env.NEXT_PUBLIC_HF_SPACE_OWNER;
  const name = process.env.NEXT_PUBLIC_HF_SPACE_NAME;

  if (owner && name) {
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return `https://${owner}-${normalizedName}.hf.space`;
  }

  // Fallback to explicit URL or localhost
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

const nextConfig: NextConfig = {
  // Enable CSS Modules with TypeScript support
  // CSS Modules are enabled by default in Next.js

  // Optimize for production
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 375, 768, 1200, 1920],
  },

  // Performance optimizations
  reactStrictMode: false,

  // Environment variables - automatically derived from HF Space config
  env: {
    NEXT_PUBLIC_API_URL: getHuggingFaceApiUrl(),
  },

  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
