import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Wrench, Users, BarChart3, MessageCircle, Package } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Inter Medi-A
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Solusi Terpercaya untuk Kebutuhan Printer, Fotocopy, dan Komputer Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Belanja Sekarang
                </Button>
              </Link>
              <Link href="/service-request">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Wrench className="mr-2 h-5 w-5" />
                  Service Center
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Layanan Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan berbagai layanan untuk memenuhi kebutuhan bisnis dan personal Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <ShoppingCart className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl">E-commerce</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li>• Katalog Produk Lengkap</li>
                  <li>• Shopping Cart & Checkout</li>
                  <li>• Sistem Pembayaran</li>
                  <li>• Order Tracking</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Wrench className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Service Center</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li>• Perbaikan Printer</li>
                  <li>• Service Fotocopy</li>
                  <li>• Maintenance Komputer</li>
                  <li>• Konsultasi Teknis</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Admin Panel</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li>• Product Management</li>
                  <li>• Order Management</li>
                  <li>• User Management</li>
                  <li>• Payment Verification</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <CardTitle className="text-xl">POS System</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li>• Point of Sale</li>
                  <li>• Receipt Generation</li>
                  <li>• Stock Management</li>
                  <li>• Sales Reporting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <MessageCircle className="h-12 w-12 text-pink-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Chat Support</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li>• Real-time Messaging</li>
                  <li>• Customer Support</li>
                  <li>• Admin Dashboard</li>
                  <li>• Message Notifications</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <Package className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <CardTitle className="text-xl">Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-gray-600 space-y-2 text-left">
                  <li>• Stock Tracking</li>
                  <li>• Product Categories</li>
                  <li>• Supplier Management</li>
                  <li>• Reports & Analytics</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Siap Memulai?
            </h2>
            <p className="text-gray-600 mb-8">
              Bergabunglah dengan ribuan pelanggan yang telah mempercayai layanan kami
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Daftar Sekarang
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Masuk ke Akun
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold mb-4">Hubungi Kami</h3>
          <div className="max-w-2xl mx-auto">
            <p className="mb-2">📍 Jln Klingkit Dalam Blok C No 22, RT 010/011</p>
            <p className="mb-2">Rawa Buaya, Cengkareng, Jakarta Barat 11470</p>
            <p className="mb-2">📞 Telepon: (021) 1234-5678</p>
            <p>✉️ Email: info@intermedia.com</p>
          </div>
        </div>
      </section>
    </div>
  );
}
