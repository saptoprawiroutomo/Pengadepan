/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Disable TypeScript errors during build for production
    ignoreBuildErrors: true,
  },
  experimental: {
    // Disable PostCSS processing
    turbo: {
      rules: {
        '*.css': {
          loaders: ['css-loader'],
          as: '*.css',
        },
      },
    },
  },
}

module.exports = nextConfig
