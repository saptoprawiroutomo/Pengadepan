'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: { name: string; slug: string };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

function ProductsContent() {
  const { data: session } = useSession();
  const { refreshCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addedToCart, setAddedToCart] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('category') || '';

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) {
        console.error('Failed to fetch products:', response.status);
        return;
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      
      if (!response.ok) {
        console.error('Failed to fetch categories:', response.status);
        setCategories([]);
        return;
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('Categories API error:', data.error);
        setCategories([]);
        return;
      }
      
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error('Categories data is not an array:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = async (productId: string) => {
    if (!session) {
      toast.info('Silakan login terlebih dahulu');
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          qty: 1
        }),
      });

      if (response.ok) {
        // Show success animation
        setAddedToCart(productId);
        refreshCart();
        
        // Hide animation after 2 seconds
        setTimeout(() => {
          setAddedToCart(null);
        }, 2000);
      } else {
        toast.error('Gagal menambahkan ke keranjang');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search & Filter */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-2xl"
            />
          </div>
          <Button type="submit" className="rounded-2xl">Cari</Button>
        </form>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          <Link href="/products">
            <Badge variant={!categoryFilter ? "default" : "secondary"} className="cursor-pointer">
              Semua
            </Badge>
          </Link>
          {categories.map((category) => (
            <Link key={category._id} href={`/products?category=${category.slug}`}>
              <Badge 
                variant={categoryFilter === category.slug ? "default" : "secondary"}
                className="cursor-pointer"
              >
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product._id} className="rounded-2xl hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="bg-muted rounded-2xl h-48 mb-4 flex items-center justify-center">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span className="text-4xl">📦</span>
                )}
              </div>
              
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {product.categoryId?.name || product.category?.name || 'Uncategorized'}
                </Badge>
                
                <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-primary">
                    Rp {product.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Stok: {product.stock}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1 rounded-2xl">
                    <Link href={`/products/${product.slug}`}>Detail</Link>
                  </Button>
                  <Button 
                    size="sm" 
                    className={`rounded-2xl transition-all duration-300 ${
                      addedToCart === product._id 
                        ? 'bg-green-500 hover:bg-green-600 scale-110' 
                        : ''
                    }`}
                    disabled={product.stock === 0}
                    onClick={() => handleAddToCart(product._id)}
                  >
                    {addedToCart === product._id ? (
                      <div className="flex items-center gap-1">
                        <span className="animate-bounce">✓</span>
                        <span className="text-xs">Added!</span>
                      </div>
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
