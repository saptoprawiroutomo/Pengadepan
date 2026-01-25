/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'via.placeholder.com',
      'images.unsplash.com',
      'cdn.shopify.com',
      'epson.com',
      'ssl-product-images.www8-hp.com',
      'www.canon.co.id',
      'dummyimage.com'
    ],
    unoptimized: true
  },
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  experimental: {
    staticPageGenerationTimeout: 1000,
  }
};

module.exports = nextConfig;
