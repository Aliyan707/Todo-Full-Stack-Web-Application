import type { NextConfig } from "next";

/**
 * Next.js Configuration
 * Configured for Hugging Face Space deployment
 */

/**
 * Resolve API URL with proper precedence:
 * 1. NEXT_PUBLIC_API_URL (explicit, highest priority)
 * 2. Derived from HF Space owner/name
 * 3. Localhost fallback for development
 */
function getApiUrl(): string {
  // Priority 1: Explicit API URL (recommended for Vercel)
  const explicitUrl = process.env.NEXT_PUBLIC_API_URL;
  if (explicitUrl && !explicitUrl.includes('localhost')) {
    return explicitUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  // Priority 2: Derive from HuggingFace Space config
  const owner = process.env.NEXT_PUBLIC_HF_SPACE_OWNER;
  const name = process.env.NEXT_PUBLIC_HF_SPACE_NAME;
  if (owner && name) {
    const normalizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    return `https://${owner}-${normalizedName}.hf.space`;
  }

  // Priority 3: Localhost fallback for development
  return 'http://localhost:8000';
}

// Get backend URL for rewrites
function getBackendUrl(): string {
  const owner = process.env.NEXT_PUBLIC_HF_SPACE_OWNER || 'aliyanahmed';
  const name = process.env.NEXT_PUBLIC_HF_SPACE_NAME || 'TodoFullStackWebApplication';
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  return `https://${owner}-${normalizedName}.hf.space`;
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

  // Environment variables - resolved at build time
  env: {
    NEXT_PUBLIC_API_URL: getApiUrl(),
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

  // Rewrites to proxy API calls to backend (avoids CORS issues in production)
  async rewrites() {
    const backendUrl = getBackendUrl();
    const isDev = process.env.NODE_ENV === 'development';

    // In development, proxy to localhost; in production, to HuggingFace Space
    const destination = isDev ? 'http://localhost:8000/api/:path*' : `${backendUrl}/api/:path*`;

    return [
      {
        source: '/api/:path*',
        destination: destination,
      },
    ];
  },
};

export default nextConfig;
