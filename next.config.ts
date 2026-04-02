import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Strict mode for React
  reactStrictMode: true,

  // Enable experimental features
  experimental: {
    // Server Actions are stable in Next.js 14+
  },

  // Image domains for Supabase storage
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
