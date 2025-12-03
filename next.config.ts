import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
