import { MetadataRoute } from 'next'

// Disable manifest in development to avoid CORS issues with GitHub Codespaces
export default function manifest(): MetadataRoute.Manifest {
  // Always return manifest for production builds
  return {
    name: 'Inter Medi-A - Toko Printer & Komputer',
    short_name: 'Inter Medi-A',
    description: 'Toko printer, fotocopy, dan komputer terpercaya di Jakarta',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#dc2626',
    icons: [
      {
        src: '/logo-im.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/logo-im.svg', 
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
    categories: ['shopping', 'business'],
    lang: 'id',
    dir: 'ltr',
  }
}
