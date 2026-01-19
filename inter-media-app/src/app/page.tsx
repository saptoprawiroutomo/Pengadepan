'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Wrench, Truck, Shield } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  categoryId: { name: string };
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=4');
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 mb-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Solusi Terpercaya untuk Kebutuhan <span className="text-primary">Printer</span> & <span className="text-secondary">Komputer</span> Anda
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Dapatkan produk berkualitas dan layanan servis profesional untuk printer, fotocopy, dan komputer.
          </p>
          <div className="flex gap-4">
            <Button size="lg" className="rounded-2xl" asChild>
              <Link href="/products">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Belanja Sekarang
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-2xl" asChild>
              <Link href="/service-request">
                <Wrench className="mr-2 h-5 w-5" />
                Request Servis
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-6 text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">E-Commerce</h3>
            <p className="text-muted-foreground text-sm">Belanja produk printer, fotocopy, dan komputer dengan mudah</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-6 text-center">
            <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Servis Profesional</h3>
            <p className="text-muted-foreground text-sm">Layanan perbaikan dan maintenance perangkat terpercaya</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-6 text-center">
            <div className="bg-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Pengiriman Cepat</h3>
            <p className="text-muted-foreground text-sm">Pengiriman produk dan pickup servis yang cepat dan aman</p>
          </CardContent>
        </Card>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Kategori Produk</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Printer', 'Fotocopy', 'Komputer', 'Aksesoris'].map((category) => (
            <Card key={category} className="rounded-2xl border-border hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="bg-muted rounded-2xl h-24 mb-4 flex items-center justify-center">
                  <span className="text-2xl">🖨️</span>
                </div>
                <h3 className="font-medium">{category}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Produk Unggulan</h2>
          <Button variant="outline" asChild className="rounded-2xl">
            <Link href="/products">Lihat Semua</Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <Card key={product._id} className="rounded-2xl hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="bg-muted rounded-2xl h-48 mb-4 flex items-center justify-center">
                  {product.images.length > 0 ? (
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
                  <Badge variant="secondary" className="text-xs" asChild>
                    <Link href={`/products?category=${product.categoryId.name.toLowerCase()}`}>
                      {product.categoryId.name}
                    </Link>
                  </Badge>
                  
                  <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  
                  <Button asChild size="sm" className="w-full rounded-2xl">
                    <Link href={`/products/${product.slug}`}>
                      Lihat Detail
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-card rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Butuh Bantuan?</h2>
        <p className="text-muted-foreground mb-6">
          Tim customer service kami siap membantu Anda 24/7
        </p>
        <Button className="rounded-2xl" asChild>
          <a 
            href="https://wa.me/6289533396142" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            📱 Hubungi Kami di WhatsApp
          </a>
        </Button>
      </section>
    </div>
  );
}
