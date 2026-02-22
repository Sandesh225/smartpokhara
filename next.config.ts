import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // If you are using Next.js 15, keep this. If older, remove 'experimental'.
  // React Compiler is not yet supported in this version's experimental config
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
  },
};

export default nextConfig;
