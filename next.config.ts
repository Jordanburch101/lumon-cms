import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

// Enables 'use cache' + cacheTag for tag-based revalidation
const nextConfig: NextConfig = {
  cacheComponents: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.railway.app",
      },
    ],
  },
};

export default withPayload(nextConfig);
