/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Disable TypeScript errors during build for production
    ignoreBuildErrors: true,
  },
  eslint: {
    // Disable ESLint errors during build for production
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
