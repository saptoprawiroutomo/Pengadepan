/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
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
  // Disable static generation for problematic pages
  generateStaticParams: false,
  trailingSlash: false,
  // Skip build-time static generation
  skipTrailingSlashRedirect: true,
  // Disable static optimization for now
  experimental: {
    ...nextConfig?.experimental,
    staticPageGenerationTimeout: 1000,
  }
};

module.exports = nextConfig;
