import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Produk Printer, Fotocopy & Komputer - Inter Medi-A',
  description: 'Jual printer Canon, Epson, HP, mesin fotocopy, laptop, komputer, tinta printer original, spare part printer. Harga terjangkau, kualitas terjamin, garansi resmi.',
  keywords: [
    'jual printer jakarta',
    'printer canon murah',
    'printer epson jakarta',
    'printer hp laserjet',
    'mesin fotocopy canon',
    'laptop asus lenovo',
    'komputer rakitan',
    'tinta printer original',
    'cartridge printer',
    'spare part printer'
  ],
  openGraph: {
    title: 'Produk Printer, Fotocopy & Komputer - Inter Medi-A',
    description: 'Jual printer Canon, Epson, HP, mesin fotocopy, laptop, komputer. Harga terjangkau, kualitas terjamin, garansi resmi.',
    images: ['/products-og.jpg'],
  },
  alternates: {
    canonical: '/products',
  },
}

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
