/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'epson.com',
      },
      {
        protocol: 'https',
        hostname: 'ssl-product-images.www8-hp.com',
      },
      {
        protocol: 'https',
        hostname: 'www.canon.co.id',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
      },
    ],
    unoptimized: true
  },
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
};

module.exports = nextConfig;
