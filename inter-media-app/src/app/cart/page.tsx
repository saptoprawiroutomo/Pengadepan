'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

interface CartItem {
  productId: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    stock: number;
    images: string[];
  };
  qty: number;
  priceSnapshot: number;
}

interface Cart {
  _id: string;
  items: CartItem[];
}

export default function CartPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    if (session) {
      fetchCart();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const updateQuantity = async (productId: string, qty: number) => {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qty }),
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const calculateTotal = () => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + (item.priceSnapshot * item.qty), 0);
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="mb-4">Silakan login untuk melihat keranjang</p>
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
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Keranjang Kosong</h2>
            <p className="text-muted-foreground mb-4">Belum ada produk di keranjang Anda</p>
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
      <h1 className="text-2xl font-bold mb-6">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.productId._id} className="rounded-2xl">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="bg-muted rounded-2xl w-20 h-20 flex items-center justify-center flex-shrink-0">
                    {item.productId.images.length > 0 ? (
                      <img 
                        src={item.productId.images[0]} 
                        alt={item.productId.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{item.productId.name}</h3>
                    <p className="text-primary font-medium">
                      Rp {item.priceSnapshot.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Stok: {item.productId.stock}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.productId._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId._id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={(e) => {
                          const qty = parseInt(e.target.value) || 1;
                          updateQuantity(item.productId._id, qty);
                        }}
                        className="w-16 h-8 text-center rounded-2xl"
                        min="1"
                        max={item.productId.stock}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.productId._id, item.qty + 1)}
                        disabled={item.qty >= item.productId.stock}
                        className="h-8 w-8 p-0 rounded-full"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm font-medium">
                      Rp {(item.priceSnapshot * item.qty).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <Card className="rounded-2xl sticky top-4">
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal ({cart.items.length} item)</span>
                <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                </div>
              </div>

              <Button asChild className="w-full rounded-2xl">
                <Link href="/checkout-new">Lanjut ke Checkout</Link>
              </Button>

              <Button asChild variant="outline" className="w-full rounded-2xl">
                <Link href="/products">Lanjut Belanja</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
