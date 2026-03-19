import type { NextConfig } from "next";

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.paypal.com https://www.paypalobjects.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google-analytics.com https://vercel.live",
  "frame-src 'self' https://*.paypal.com https://www.paypalobjects.com https://vercel.live",
  "img-src 'self' data: blob: https://*.paypal.com https://www.paypalobjects.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://*.googleusercontent.com https://www.google.com https://www.google.co.cr https://www.googletagmanager.com https://googleads.g.doubleclick.net https://stats.g.doubleclick.net",
  "connect-src 'self' https://*.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://www.google-analytics.com https://analytics.google.com https://*.vercel-insights.com https://*.vercel-analytics.com https://vercel.live wss://ws-us3.pusher.com https://www.google.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://stats.g.doubleclick.net https://www.google.co.cr",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "worker-src blob: 'self'",
].join("; ");

const nextConfig: NextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy,
          },
        ],
      },
    ];
  },

  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  turbopack: {
    root: __dirname,
  },

  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "recharts",
      "date-fns",
    ],
    turbopackFileSystemCacheForBuild: true,
  },

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

export default nextConfig;