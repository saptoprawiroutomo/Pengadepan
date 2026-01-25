import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Wrench, Phone, MapPin, Clock, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Inter Medi-A
            </h1>
            <p className="text-xl md:text-2xl mb-4 opacity-90">
              Toko Printer, Fotocopy & Komputer Terpercaya
            </p>
            <p className="text-lg mb-8 opacity-80">
              Melayani penjualan dan service peralatan kantor sejak 2020
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 w-full sm:w-auto">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Lihat Produk
                </Button>
              </Link>
              <Link href="/service/request">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto">
                  <Wrench className="mr-2 h-5 w-5" />
                  Service Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Produk Unggulan
            </h2>
            <p className="text-gray-600">
              Berbagai pilihan printer, fotocopy, dan komputer berkualitas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🖨️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Printer</h3>
                <p className="text-gray-600 mb-4">
                  Printer inkjet, laser, dan dot matrix untuk berbagai kebutuhan
                </p>
                <Link href="/products?category=printer">
                  <Button className="bg-red-600 hover:bg-red-700 text-white" size="sm">Lihat Printer</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fotocopy</h3>
                <p className="text-gray-600 mb-4">
                  Mesin fotocopy digital dan analog untuk kantor dan usaha
                </p>
                <Link href="/products?category=fotocopy">
                  <Button className="bg-red-600 hover:bg-red-700 text-white" size="sm">Lihat Fotocopy</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💻</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Komputer</h3>
                <p className="text-gray-600 mb-4">
                  PC desktop, laptop, dan aksesoris komputer lengkap
                </p>
                <Link href="/products?category=komputer">
                  <Button className="bg-red-600 hover:bg-red-700 text-white" size="sm">Lihat Komputer</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/products">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
                Lihat Semua Produk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Layanan Kami
            </h2>
            <p className="text-gray-600">
              Service center terpercaya dengan teknisi berpengalaman
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Service & Repair</h3>
              <p className="text-gray-600 text-sm">Perbaikan printer, fotocopy, dan komputer</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔧</span>
              </div>
              <h3 className="font-semibold mb-2">Maintenance</h3>
              <p className="text-gray-600 text-sm">Perawatan rutin peralatan kantor</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="font-semibold mb-2">Konsultasi</h3>
              <p className="text-gray-600 text-sm">Konsultasi teknis dan rekomendasi</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold mb-2">Antar Jemput</h3>
              <p className="text-gray-600 text-sm">Layanan antar jemput area Jakarta</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/service/request">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                <Wrench className="mr-2 h-5 w-5" />
                Request Service
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Pilih Inter Medi-A?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Star className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Berpengalaman</h3>
              <p className="text-gray-600">
                Lebih dari 4 tahun melayani kebutuhan peralatan kantor di Jakarta
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Terpercaya</h3>
              <p className="text-gray-600">
                Garansi resmi dan after-sales service yang memuaskan
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Harga Bersaing</h3>
              <p className="text-gray-600">
                Harga kompetitif dengan kualitas terjamin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Kunjungi Toko Kami</h2>
              <p className="text-gray-300">
                Datang langsung ke toko atau hubungi kami untuk konsultasi
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <MapPin className="h-8 w-8 mx-auto mb-4 text-blue-400" />
                <h3 className="font-semibold mb-2">Alamat</h3>
                <p className="text-gray-300 text-sm">
                  Jln Klingkit Dalam Blok C No 22<br/>
                  RT 010/011, Rawa Buaya<br/>
                  Cengkareng, Jakarta Barat 11470
                </p>
              </div>

              <div>
                <Phone className="h-8 w-8 mx-auto mb-4 text-green-400" />
                <h3 className="font-semibold mb-2">Telepon</h3>
                <p className="text-gray-300 text-sm">
                  (021) 1234-5678<br/>
                  WhatsApp: 0812-3456-7890
                </p>
              </div>

              <div>
                <Clock className="h-8 w-8 mx-auto mb-4 text-yellow-400" />
                <h3 className="font-semibold mb-2">Jam Buka</h3>
                <p className="text-gray-300 text-sm">
                  Senin - Sabtu: 08:00 - 17:00<br/>
                  Minggu: 09:00 - 15:00
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white w-full sm:w-auto">
                    Masuk ke Akun
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                    Daftar Sekarang
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
