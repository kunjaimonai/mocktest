/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["http://192.168.0.4", "http://192.168.0.4:3000"],
  images: {
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cprcrmwwpcixfhfyjmuk.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
