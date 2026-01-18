// next.config.ts  (recommended to use .ts for better type safety)
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  // turbopack: false,  // ← REMOVE or COMMENT this out
  // Turbopack is default in Next.js 16 — no need to set false unless forcing webpack
  // If you want to opt out of Turbopack entirely (use webpack), do it via CLI flags instead:
  //   next dev --webpack
  //   next build --webpack
  images: {
    unoptimized: false,
    // remotePatterns: [
    //   { protocol: "https", hostname: "**" }, // or your specific ones
    // ],
  },
  poweredByHeader: false,
  reactStrictMode: true,
  // Optional: enable filesystem caching for faster Turbopack dev restarts (recommended)
  // experimental: {
  //   turbopackFileSystemCacheForDev: true,
  // },
};

export default nextConfig;