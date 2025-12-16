/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
    },
  },
  images: {
    remotePatterns: [],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize native binary modules for server-side rendering
      config.externals.push({
        '@resvg/resvg-js': 'commonjs @resvg/resvg-js',
      });
    }

    // Ignore native binary files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return config;
  },
}

module.exports = nextConfig
