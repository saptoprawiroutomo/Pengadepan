'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  qty: number;
  priceSnapshot: number;
}

interface Cart {
  items: CartItem[];
}

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [paymentInfo, setPaymentInfo] = useState<any[]>([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch('/api/cart');
        if (response.ok) {
          const data = await response.json();
          setCart(data);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
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

    if (session) {
      fetchCart();
      fetchPaymentInfo();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + (item.priceSnapshot * item.qty), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingAddress.trim()) {
      toast.warning('Alamat pengiriman wajib diisi');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress,
          paymentMethod
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Pesanan berhasil dibuat!');
        router.push('/orders');
      } else {
        alert(result.error || 'Gagal membuat pesanan');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="mb-4">Silakan login untuk checkout</p>
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

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="mb-4">Keranjang kosong</p>
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
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checkout Form */}
        <div>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Informasi Pengiriman</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="shippingAddress">Alamat Pengiriman *</Label>
                  <Textarea
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Masukkan alamat lengkap untuk pengiriman"
                    className="rounded-2xl"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">Transfer Bank</SelectItem>
                      <SelectItem value="ovo">OVO</SelectItem>
                      <SelectItem value="dana">DANA</SelectItem>
                      <SelectItem value="cod">Bayar di Tempat (COD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  className="w-full rounded-2xl"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Memproses...' : 'Buat Pesanan'}
                </Button>
              </form>

              {/* Payment Information */}
              {paymentMethod === 'transfer' && paymentInfo.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-2xl">
                  <h3 className="font-semibold mb-3">Informasi Pembayaran</h3>
                  {paymentInfo
                    .filter(info => info.type === 'bank_transfer')
                    .map((info, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="font-medium text-blue-600">{info.bankName}</p>
                          <p className="text-sm">No. Rekening: <span className="font-mono font-bold">{info.accountNumber}</span></p>
                          <p className="text-sm">Atas Nama: <span className="font-medium">{info.accountName}</span></p>
                          <p className="text-xs text-gray-600 mt-2">{info.instructions}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {(paymentMethod === 'ovo' || paymentMethod === 'dana') && paymentInfo.length > 0 && (
                <div className="mt-6 p-4 bg-green-50 rounded-2xl">
                  <h3 className="font-semibold mb-3">Informasi Pembayaran {paymentMethod.toUpperCase()}</h3>
                  {paymentInfo
                    .filter(info => info.type === paymentMethod)
                    .map((info, index) => (
                      <div key={index} className="mb-4 last:mb-0">
                        <div className="bg-white p-3 rounded-lg border">
                          <p className="font-medium text-green-600">Transfer {paymentMethod.toUpperCase()}</p>
                          <p className="text-sm">Nomor HP: <span className="font-mono font-bold">{info.phoneNumber}</span></p>
                          <p className="text-sm">Atas Nama: <span className="font-medium">Toko Inter Media</span></p>
                          <p className="text-xs text-gray-600 mt-2">{info.instructions}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.productId._id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium">{item.productId.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.qty} x Rp {item.priceSnapshot.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <p className="font-medium">
                    Rp {(item.priceSnapshot * item.qty).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">
                    Rp {calculateTotal().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>• Pesanan akan diproses setelah pembayaran dikonfirmasi</p>
                <p>• Estimasi pengiriman 1-3 hari kerja</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
