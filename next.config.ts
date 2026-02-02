import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // If you are using Next.js 15, keep this. If older, remove 'experimental'.
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
