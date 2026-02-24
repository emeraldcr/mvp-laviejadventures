// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google profile pictures
      { protocol: "https", hostname: "avatars.githubusercontent.com" }, // GitHub profile pictures
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },

  // Keep skipping type-check during build (run tsc separately in CI)
  typescript: {
    ignoreBuildErrors: true,
  },
  // REMOVE this entirely (deprecated/no longer valid in 16.x)
  // eslint: { ignoreDuringBuilds: true },

  // Good: optimize heavy imports
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "recharts",
      "date-fns",
      // Add more if relevant: "lodash-es", "@radix-ui/*", etc.
    ],

    // === Turbopack filesystem cache (add these if you want explicit control) ===
    // turbopackFileSystemCacheForDev: true,     // already default in 16.1+ — optional to include
    turbopackFileSystemCacheForBuild: true,      // opt-in for faster repeated `next build`
  },

  // Drop console in prod
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Optional extras for even more speed (if compatible with your app)
  // swcMinify: true,  // usually default, but explicit is fine
};

export default nextConfig;