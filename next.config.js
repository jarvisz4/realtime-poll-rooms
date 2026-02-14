/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // WebSocket support for development
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    return config;
  },
  // Environment variables that should be available at build time
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

module.exports = nextConfig;
