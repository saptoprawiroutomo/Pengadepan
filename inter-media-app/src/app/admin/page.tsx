import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, Tag, ShoppingCart, Wrench, BarChart3 } from 'lucide-react';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  const menuItems = [
    { title: 'Kategori', href: '/admin/categories', icon: Tag, desc: 'Kelola kategori produk' },
    { title: 'Produk', href: '/admin/products', icon: Package, desc: 'Kelola produk dan stok' },
    { title: 'Users', href: '/admin/users', icon: Users, desc: 'Kelola pengguna sistem' },
    { title: 'Orders', href: '/admin/orders', icon: ShoppingCart, desc: 'Kelola pesanan customer' },
    { title: 'Service Requests', href: '/admin/service-requests', icon: Wrench, desc: 'Kelola request servis' },
    { title: 'Laporan', href: '/admin/reports', icon: BarChart3, desc: 'Lihat laporan penjualan' },
    { title: 'Pembayaran', href: '/admin/payment-settings', icon: BarChart3, desc: 'Kelola rekening bank' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Selamat datang, {session.user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.href} className="rounded-2xl hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">{item.desc}</p>
              <Button asChild className="w-full rounded-2xl">
                <Link href={item.href}>Kelola {item.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
