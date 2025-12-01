import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Оптимизация памяти: ограничиваем размер кэша
    if (!isServer) {
      config.cache = {
        type: 'filesystem',
        maxMemoryGenerations: 1, // Ограничиваем поколения кэша в памяти
      };
    }
    return config;
  },
};

export default nextConfig;
