import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // <-- ADD THIS
  images: { unoptimized: true }, // <-- ADD THIS for GitHub Pages
  basePath: "/Fitbud-Dashboard",   // <-- ADD THIS (must replace 'your-repo-name')
  assetPrefix: "/Fitbud-Dashboard/", // <-- ADD THIS
  env: {
    NEXT_PUBLIC_BASE_PATH: "/Fitbud-Dashboard",
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
