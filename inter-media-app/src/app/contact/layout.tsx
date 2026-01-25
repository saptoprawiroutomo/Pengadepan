import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontak Kami - Inter Medi-A | Hubungi Toko Printer Jakarta',
  description: 'Hubungi Inter Medi-A untuk konsultasi printer, fotocopy, dan komputer. Alamat: Jakarta, Telepon: +62-21-12345678. Buka Senin-Sabtu 08:00-17:00.',
  keywords: [
    'kontak inter media',
    'alamat toko printer jakarta',
    'telepon inter media',
    'jam buka inter media',
    'lokasi toko komputer jakarta',
    'hubungi inter media',
    'konsultasi printer'
  ],
  openGraph: {
    title: 'Kontak Kami - Inter Medi-A | Hubungi Toko Printer Jakarta',
    description: 'Hubungi Inter Medi-A untuk konsultasi printer, fotocopy, dan komputer. Buka Senin-Sabtu 08:00-17:00.',
    images: ['/contact-og.jpg'],
  },
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
