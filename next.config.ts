// next.config.ts  (recommended to use .ts for better type safety)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,

  images: {
    unoptimized: false,
    formats: ["image/avif", "image/webp"],
    // remotePatterns: [
    //   { protocol: "https", hostname: "**" }, // or your specific ones
    // ],
  },

  // Skip type-checking and linting during `next build` — run them as separate
  // CI steps (tsc --noEmit && eslint) so the build itself stays fast.
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Tree-shake heavy packages so only the icons / components actually imported
  // end up in the bundle.  Speeds up both build and runtime.
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "recharts",
      "date-fns",
    ],
  },

  // Drop console.* calls from production builds.
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
