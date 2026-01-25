'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  description?: string;
  categoryId: { name: string; slug: string };
}

export default function ProductDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const { refreshCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.slug}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const handleAddToCart = async () => {
    if (!session) {
      toast.info('Silakan login terlebih dahulu');
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product!._id,
          qty: quantity
        }),
      });

      if (response.ok) {
        // Show success animation
        setShowSuccess(true);
        refreshCart(); // Update cart count
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 3000);
      } else {
        toast.error('Gagal menambahkan ke keranjang');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Produk tidak ditemukan</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="bg-muted rounded-2xl h-96 flex items-center justify-center">
                {product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span className="text-6xl">📦</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.categoryId.name}
            </Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-primary">
              Rp {product.price.toLocaleString('id-ID')}
            </p>
          </div>

          {product.description && (
            <div>
              <h3 className="font-semibold mb-2">Deskripsi</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2">Stok Tersedia</h3>
            <p className="text-lg">{product.stock} unit</p>
          </div>

          {product.stock > 0 && (
            <Card className="rounded-2xl">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Jumlah</label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="rounded-2xl"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                        className="w-20 text-center rounded-2xl"
                        min="1"
                        max={product.stock}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="rounded-2xl"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className={`flex-1 rounded-2xl transition-all duration-300 ${
                        showSuccess 
                          ? 'bg-green-500 hover:bg-green-600' 
                          : ''
                      }`}
                    >
                      {showSuccess ? (
                        <>
                          <span className="animate-bounce mr-2">✓</span>
                          Berhasil Ditambahkan!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {isAddingToCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Success Toast */}
                  {showSuccess && (
                    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
                      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
                        <span className="animate-bounce">🛒</span>
                        <div>
                          <p className="font-medium">Produk ditambahkan!</p>
                          <p className="text-sm opacity-90">{quantity}x {product.name}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Subtotal: Rp {(product.price * quantity).toLocaleString('id-ID')}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {product.stock === 0 && (
            <Card className="rounded-2xl border-destructive">
              <CardContent className="p-6 text-center">
                <p className="text-destructive font-medium">Stok Habis</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Produk ini sedang tidak tersedia
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
