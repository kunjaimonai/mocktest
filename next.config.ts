import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow specific dev origins to request Next.js dev/_next assets
  // (prevents future Next.js warnings about cross-origin dev requests)
  allowedDevOrigins: ["http://192.168.0.4", "http://192.168.0.4:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cprcrmwwpcixfhfyjmuk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
