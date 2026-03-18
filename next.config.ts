// next.config.ts
import type { NextConfig } from "next";

// PayPal + other third-party domains needed for Content Security Policy.
// iOS Safari enforces CSP strictly — frame-src and script-src must explicitly
// include PayPal domains or the SDK iframe will be blocked on mobile.
const ContentSecurityPolicy = [
  "default-src 'self'",
  // Scripts: self, inline (Next.js needs unsafe-inline), PayPal SDK, Google Ads/Analytics
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.paypalobjects.com https://www.sandbox.paypal.com https://www.googletagmanager.com https://googleads.g.doubleclick.net https://www.google-analytics.com",
  // Frames: PayPal checkout iframe (critical for iOS — without this Safari blocks the payment popup)
  "frame-src 'self' https://www.paypal.com https://www.paypalobjects.com https://www.sandbox.paypal.com",
  // Images: allow PayPal logos + Google/CDN images already used in the app
  "img-src 'self' data: blob: https://www.paypal.com https://www.paypalobjects.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://*.googleusercontent.com",
  // Fetch/XHR: PayPal APIs + Google Analytics
  "connect-src 'self' https://www.paypal.com https://api-m.paypal.com https://api-m.sandbox.paypal.com https://www.sandbox.paypal.com https://www.google-analytics.com https://analytics.google.com https://*.vercel-insights.com https://*.vercel-analytics.com",
  // Styles: allow inline styles (Tailwind + framer-motion)
  "style-src 'self' 'unsafe-inline'",
  // Fonts
  "font-src 'self' data:",
  // Workers (needed by some PayPal SDK internals)
  "worker-src blob: 'self'",
].join("; ");

const nextConfig: NextConfig = {
  trailingSlash: false,
  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        // Apply CSP to all page routes (HTML responses)
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
    // Disable Next.js on-the-fly optimization to avoid Vercel image transformation/cache spikes.
    // Images are served as-is from the source URL/static asset.
    unoptimized: true,
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
