'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Upload, CreditCard, Package, Truck, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Order {
  _id: string;
  orderCode: string;
  items: any[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  paymentMethod: string;
  paymentProof?: string;
  trackingNumber?: string;
  createdAt: string;
}

interface PaymentInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  instructions: string;
}

export default function OrderDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (session && params.id) {
      // If accessing invalid old ID, redirect to orders page
      if (params.id === '696e86800a36cf9b8a9381b5') {
        router.push('/orders');
        return;
      }
      fetchOrder();
      fetchPaymentInfo();
    }
  }, [session, params.id, router]);

  const fetchOrder = async () => {
    try {
      console.log('Fetching order with ID:', params.id);
      const response = await fetch(`/api/orders/${params.id}`);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Order data received:', data.order);
        setOrder(data.order);
      } else {
        console.error('Order not found or access denied, status:', response.status);
        // Instead of redirecting, show error message
        setOrder(null);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentInfo = async () => {
    try {
      const response = await fetch('/api/payment-info');
      if (response.ok) {
        const data = await response.json();
        setPaymentInfo(data);
      }
    } catch (error) {
      console.error('Error fetching payment info:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !order) return;

    setIsUploading(true);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        const response = await fetch(`/api/orders/${order._id}/payment-proof`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentProof: base64 })
        });

        if (response.ok) {
          fetchOrder(); // Refresh order data
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading payment proof:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="container mx-auto p-6"><div className="text-center">Loading...</div></div>;
  if (!order) return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Order Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-4">Order yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.</p>
        <Button asChild>
          <Link href="/orders">Kembali ke Daftar Order</Link>
        </Button>
      </div>
    </div>
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-blue-100 text-blue-800',
      processed: 'bg-purple-100 text-purple-800',
      shipped: 'bg-orange-100 text-orange-800',
      done: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      pending: 'Menunggu Pembayaran',
      paid: 'Sudah Dibayar',
      processed: 'Diproses',
      shipped: 'Dikirim',
      done: 'Selesai'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()}>
          ← Kembali
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Order Info */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Order #{order.orderCode}</CardTitle>
                <p className="text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {getStatusBadge(order.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <p className="font-medium">{item.nameSnapshot}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.qty}</p>
                  </div>
                  <p className="font-medium">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {order.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkir</span>
                  <span>Rp {order.shippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>Rp {order.total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Section */}
        {order.paymentMethod === 'transfer' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Pembayaran Transfer Bank
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.status === 'pending' && !order.paymentProof && (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Transfer ke Rekening:</h4>
                    {paymentInfo.map((info, index) => (
                      <div key={index} className="mb-3 last:mb-0">
                        <div className="bg-white p-3 rounded border">
                          <p className="font-bold text-lg">{info.bankName}</p>
                          <p className="text-xl font-mono">{info.accountNumber}</p>
                          <p className="text-sm">a.n. {info.accountName}</p>
                        </div>
                        {info.instructions && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {info.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="payment-proof" className="text-base font-medium">
                      Upload Bukti Transfer
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="payment-proof"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Format: JPG, PNG, max 5MB
                      </p>
                    </div>
                    {isUploading && (
                      <div className="flex items-center gap-2 mt-2 text-blue-600">
                        <Upload className="h-4 w-4 animate-spin" />
                        Mengupload bukti transfer...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {order.paymentProof && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Bukti transfer sudah diupload</span>
                  </div>
                  <div>
                    <img 
                      src={order.paymentProof} 
                      alt="Bukti Transfer" 
                      className="max-w-md rounded-lg border"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tracking Section */}
        {order.trackingNumber && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Informasi Pengiriman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Nomor Resi</span>
                  <span className="font-mono">{order.trackingNumber}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Lacak paket Anda dengan nomor resi di atas
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
