'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    slug: string;
  };
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderCode: string;
  items: OrderItem[];
  total: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Menunggu Pembayaran',
  paid: 'Sudah Dibayar',
  processed: 'Diproses',
  shipped: 'Dikirim',
  done: 'Selesai',
  cancelled: 'Dibatalkan',
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/my');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="mb-4">Silakan login untuk melihat pesanan</p>
            <Button asChild className="rounded-2xl">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardContent className="p-6 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Belum Ada Pesanan</h2>
            <p className="text-muted-foreground mb-4">Anda belum memiliki pesanan apapun</p>
            <Button asChild className="rounded-2xl">
              <Link href="/products">Mulai Belanja</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id} className="rounded-2xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.orderCode}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.nameSnapshot}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.qty} x Rp {item.priceSnapshot.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="font-medium">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span className="text-primary">
                      Rp {order.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p><strong>Alamat:</strong> {order.shippingAddress}</p>
                  <p><strong>Pembayaran:</strong> {order.paymentMethod === 'transfer' ? 'Transfer Bank' : 'Bayar di Tempat'}</p>
                </div>

                {order.status === 'pending' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
                    <p className="text-sm text-yellow-800">
                      Silakan lakukan pembayaran untuk melanjutkan pesanan Anda.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
