import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: "export" ← this is the key change
  trailingSlash: false,  // Back to your original
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'laviejaadventures.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;