/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Disable TypeScript errors during build for production
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
