import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove output: 'export' entirely
  trailingSlash: false,  // Back to original
  images: {
    unoptimized: false,  // Re-enable optimization
    remotePatterns: [ /* your patterns */ ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;