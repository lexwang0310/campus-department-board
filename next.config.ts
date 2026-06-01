import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 允许项目在有 TypeScript 类型警告/错误的情况下仍能成功打包构建 (特别适合多平台混合调试)
    ignoreBuildErrors: true,
  },
  eslint: {
    // 允许在 ESLint 有警告/错误时仍能成功打包构建
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
