import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Explicit Turbopack root to avoid workspace root inference warnings
  // Top-level turbopack root (string) to silence workspace root inference.
  // @ts-ignore
  turbopack: {
    root: path.resolve(__dirname),
  },

  // @ts-ignore - `turbopack` under experimental may be recognized in some versions
  experimental: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    turbopack: {
      root: path.resolve(__dirname),
    },
  },
  // Allow specific dev origins to request Next.js dev/_next assets
  // (prevents future Next.js warnings about cross-origin dev requests)
  allowedDevOrigins: ["http://192.168.0.4", "http://192.168.0.4:3000"],
  images: {
    // Increase cache TTL to 1 year for immutable images
    // Saves egress: repeat visitors get browser cache hit (100% savings)
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cprcrmwwpcixfhfyjmuk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Optimize image format and size
    formats: ["image/webp", "image/avif"],
  },
};

export default nextConfig;
