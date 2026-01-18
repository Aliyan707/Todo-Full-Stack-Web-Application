import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: false,

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

export default nextConfig;
