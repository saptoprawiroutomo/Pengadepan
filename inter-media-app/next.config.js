/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
  // Disable static generation
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
};

module.exports = nextConfig;
