import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
      unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "fljpqxpkpwjsfwxirpej.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
