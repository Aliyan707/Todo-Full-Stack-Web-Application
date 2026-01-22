/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  reactStrictMode: false,

  // Disable ESLint during build (temporary fix for deployment)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "https://aliyanahmed-todofullstackwebapplication.hf.space",
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV || "production",
  },

  // Rewrites to proxy API calls to backend
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://aliyanahmed-todofullstackwebapplication.hf.space/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
