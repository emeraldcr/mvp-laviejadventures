import type { NextConfig } from "next";

/**
 * Next.js configuration for MVP-LAVIEJAVENTURES.
 * 
 * Key improvements:
 * - SWC minification is enabled by default in Next.js 15+ (no need to set swcMinify explicitly).
 * - Added recommended image optimization config (domains for external images; adjust as needed).
 * - Set output: 'standalone' for easier Vercel/ Docker deploys (removes unnecessary files).
 * - Added trailingSlash: false to avoid duplicate content issues.
 * - Typed and documented for maintainability.
 * 
 * If you have specific needs (e.g., i18n, basePath), add them here.
 */

const nextConfig: NextConfig = {
  // Image optimization (adjust remotePatterns for your assets)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'laviejaadventures.com', // Example: for calendar/reservation images
        port: '',
        pathname: '/**',
      },
      // Add more e.g., { hostname: 'your-cdn.com' }
    ],
  },

  // Output config for deployment
  output: 'standalone', // Great for Vercel, Docker, or self-hosting

  // URL handling
  trailingSlash: false,
  basePath: '', // Set to '/app' if subpath deployment

  // Other common tweaks
  poweredByHeader: false, // Minor security/perf boost
  reactStrictMode: true, // Enforces best practices (already default in Next 13+)
};

export default nextConfig;