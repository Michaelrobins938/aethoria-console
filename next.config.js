/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('node-gyp');
    }
    return config;
  },
  env: {
    NODE_OPTIONS: '--max-old-space-size=8192',
  },
};

module.exports = nextConfig;