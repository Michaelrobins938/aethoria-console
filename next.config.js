/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('node-gyp');
    }
    return config;
  },
};

module.exports = nextConfig;