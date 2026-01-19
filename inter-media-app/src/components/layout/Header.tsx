'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { data: session } = useSession();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      if (session) {
        try {
          const response = await fetch('/api/cart');
          if (response.ok) {
            const cart = await response.json();
            const count = cart.items?.reduce((total: number, item: any) => total + item.qty, 0) || 0;
            setCartCount(count);
          }
        } catch (error) {
          console.error('Error fetching cart:', error);
        }
      }
    };

    fetchCartCount();
  }, [session]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/logo-im.svg" alt="Inter Medi-A" width={120} height={40} />
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Cari produk, kategori, atau brand..."
                className="pl-10 pr-4 py-2 w-full rounded-2xl border-border"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="relative" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary">
                  {cartCount}
                </Badge>
              </Link>
            </Button>
            
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5" />
                    <span className="ml-2 hidden md:inline">{session.user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">Pesanan Saya</Link>
                  </DropdownMenuItem>
                  {session.user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  {['admin', 'kasir'].includes(session.user.role) && (
                    <DropdownMenuItem asChild>
                      <Link href="/kasir/pos">POS Kasir</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">
                  <User className="h-5 w-5" />
                  <span className="ml-2 hidden md:inline">Masuk</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="py-2 border-t border-border">
          <div className="flex items-center space-x-6 text-sm">
            <Link href="/products" className="text-muted-foreground hover:text-primary">
              Semua Produk
            </Link>
            <Link href="/products?category=printer" className="text-muted-foreground hover:text-primary">
              Printer
            </Link>
            <Link href="/products?category=fotocopy" className="text-muted-foreground hover:text-primary">
              Fotocopy
            </Link>
            <Link href="/products?category=komputer" className="text-muted-foreground hover:text-primary">
              Komputer
            </Link>
            <Link href="/service/request" className="text-secondary hover:text-secondary/80 font-medium">
              Servis
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
