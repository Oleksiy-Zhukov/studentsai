import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle D3 modules properly
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Ensure proper module resolution for D3
    config.module.rules.push({
      test: /\.m?js$/,
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
};

export default nextConfig;

