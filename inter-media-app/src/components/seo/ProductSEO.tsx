'use client'

interface Product {
  _id: string
  name: string
  slug: string
  price: number
  stock: number
  images: string[]
  description?: string
  categoryId: { name: string; slug: string }
}

interface ProductSEOProps {
  product: Product
}

export function ProductSEO({ product }: ProductSEOProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - Produk berkualitas dari Inter Medi-A`,
    "image": product.images?.length > 0 ? product.images : ["/product-default.jpg"],
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": "Inter Medi-A"
    },
    "category": product.categoryId?.name || "Elektronik",
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://inter-media-app.vercel.app'}/products/${product.slug}`,
      "priceCurrency": "IDR",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Inter Medi-A",
        "url": process.env.NEXT_PUBLIC_BASE_URL || "https://inter-media-app.vercel.app"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "10"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
