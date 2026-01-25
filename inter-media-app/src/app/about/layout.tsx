import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tentang Kami - Inter Medi-A | Toko Printer & Komputer Jakarta',
  description: 'Inter Medi-A adalah toko printer, fotocopy, dan komputer terpercaya di Jakarta sejak 2020. Melayani penjualan dan service dengan teknisi berpengalaman dan garansi resmi.',
  keywords: [
    'tentang inter media',
    'toko printer jakarta terpercaya',
    'sejarah inter media',
    'visi misi inter media',
    'teknisi printer berpengalaman',
    'toko komputer jakarta',
    'service center printer'
  ],
  openGraph: {
    title: 'Tentang Kami - Inter Medi-A | Toko Printer & Komputer Jakarta',
    description: 'Inter Medi-A adalah toko printer, fotocopy, dan komputer terpercaya di Jakarta sejak 2020.',
    images: ['/about-og.jpg'],
  },
  alternates: {
    canonical: '/about',
  },
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
