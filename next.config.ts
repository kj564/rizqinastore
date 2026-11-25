import type { NextConfig } from "next";

// STATIC_EXPORT=1 -> build export statis untuk GitHub Pages (dipakai scripts/build-static.mjs)
const isStaticExport = process.env.STATIC_EXPORT === "1";
const repoName = process.env.GH_REPO_NAME || "rizqinastore";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  basePath: isStaticExport ? `/${repoName}` : undefined,
  images: { unoptimized: true },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
