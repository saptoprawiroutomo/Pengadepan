import { Metadata } from 'next'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Fetch product data
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://inter-media-app.vercel.app'}/api/products/slug/${params.slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return {
        title: 'Produk Tidak Ditemukan - Inter Medi-A',
        description: 'Produk yang Anda cari tidak ditemukan. Lihat produk lainnya di Inter Medi-A.',
      }
    }

    const product = await response.json()
    
    return {
      title: `${product.name} - Inter Medi-A`,
      description: `Beli ${product.name} di Inter Medi-A. ${product.description || 'Produk berkualitas dengan harga terjangkau.'} Stok: ${product.stock}. Harga: Rp ${product.price.toLocaleString('id-ID')}.`,
      keywords: [
        product.name,
        product.categoryId?.name || 'elektronik',
        'jakarta',
        'murah',
        'berkualitas',
        'garansi',
        'inter media'
      ],
      openGraph: {
        title: `${product.name} - Inter Medi-A`,
        description: `Beli ${product.name} di Inter Medi-A. Harga: Rp ${product.price.toLocaleString('id-ID')}. Stok tersedia.`,
        images: product.images?.length > 0 ? [product.images[0]] : ['/product-default.jpg'],
        type: 'product',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - Inter Medi-A`,
        description: `Beli ${product.name} di Inter Medi-A. Harga: Rp ${product.price.toLocaleString('id-ID')}.`,
        images: product.images?.length > 0 ? [product.images[0]] : ['/product-default.jpg'],
      },
      alternates: {
        canonical: `/products/${params.slug}`,
      },
    }
  } catch (error) {
    return {
      title: 'Produk - Inter Medi-A',
      description: 'Lihat detail produk di Inter Medi-A. Toko printer, fotocopy, dan komputer terpercaya.',
    }
  }
}

export default function ProductDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
