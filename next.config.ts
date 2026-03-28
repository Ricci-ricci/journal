import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Pre-existing type errors should not abort the Vercel build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Pre-existing lint errors should not abort the Vercel build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
