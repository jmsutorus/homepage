import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  runtimeCaching: [
    // Cache Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    // Cache Google Font files
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
    // Cache API routes - Network first with fallback
    {
      urlPattern: /^\/api\/(calendar|activities|habits|tasks|mood|media|journal)\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 5, // 5 minutes fallback
        },
      },
    },
    // Never cache auth routes
    {
      urlPattern: /^\/api\/auth\/.*/i,
      handler: "NetworkOnly",
    },
    // Cache external images - Stale while revalidate
    {
      urlPattern: /^https:\/\/(avatars\.steamstatic\.com|media\.steampowered\.com|cdn\.cloudflare\.steamstatic\.com|cdn\.akamai\.steamstatic\.com)\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "steam-images-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/(m\.media-amazon\.com|images\.theposterdb\.com)\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "media-images-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/images\.igdb\.com\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "igdb-images-cache",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    // Cache static assets - Cache first
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-images-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
  ],
  workboxOptions: {
    disableDevLogs: true,
  },
  fallbacks: {
    document: "/offline",
  },
} as any);

const nextConfig: NextConfig = {
  // Allow webpack-based PWA plugin with Turbopack
  turbopack: {},
  // Reduce memory usage during build by limiting workers
  experimental: {
    // Limit the number of workers for static page generation
    workerThreads: false,
    cpus: 1,
  },
  images: {
    remotePatterns: [
      // Steam avatars and game images
      {
        protocol: "https",
        hostname: "avatars.steamstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.steampowered.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.cloudflare.steamstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.akamai.steamstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn2.steamgriddb.com",
        pathname: "/**",
      },
      // Amazon Media (for movie posters etc)
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.theposterdb.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.squarespace-cdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "external-content.duckduckgo.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.igdb.com",
        pathname: "/**",
      },
      // Plex/Tautulli images (localhost)
      // Note: If your Tautulli is on a custom domain, add it here
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "**.local",
        pathname: "/**",
      },
      // Add your custom Tautulli/Home Assistant domains here if needed
      // Example:
      // {
      //   protocol: "https",
      //   hostname: "your-domain.com",
      //   pathname: "/**",
      // },
    ],
  },
};

export default withPWA(nextConfig);
