'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, BarChart3, Users } from 'lucide-react';

export default function KasirPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (!['admin', 'kasir'].includes(session.user.role)) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!session || !['admin', 'kasir'].includes(session.user.role)) {
    return null;
  }

  const menuItems = [
    { 
      title: 'POS Kasir', 
      href: '/kasir/pos', 
      icon: ShoppingCart, 
      desc: 'Sistem Point of Sale untuk transaksi' 
    },
    { 
      title: 'Laporan Penjualan', 
      href: '/admin/reports', 
      icon: BarChart3, 
      desc: 'Lihat laporan penjualan dan statistik' 
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Kasir</h1>
        <p className="text-muted-foreground">Selamat datang, {session.user.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon className="h-6 w-6 text-primary" />
                  <span>{item.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{item.desc}</p>
                <Button asChild className="w-full">
                  <Link href={item.href}>Buka {item.title}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
