import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_API_URL || "",
        pathname: "/media/**",
      }
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
