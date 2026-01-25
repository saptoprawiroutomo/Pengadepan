'use client';

import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '@/contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const { data: session } = useSession();
  const { cartCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-auto">
              <rect x="8" y="8" width="24" height="24" rx="4" fill="#D32F2F"/>
              <text x="12" y="26" fill="white" fontFamily="Inter" fontWeight="bold" fontSize="14">IM</text>
              <text x="40" y="16" fill="#1565C0" fontFamily="Inter" fontWeight="600" fontSize="12">Inter</text>
              <text x="40" y="28" fill="#1565C0" fontFamily="Inter" fontWeight="600" fontSize="12">Medi-A</text>
            </svg>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
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
                  <DropdownMenuItem asChild>
                    <Link href="/service/my">Servis Saya</Link>
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
                  <DropdownMenuItem onClick={async () => {
                    await signOut({ redirect: false });
                    window.location.href = '/';
                  }}>
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

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari produk..."
              className="pl-10 pr-4 py-2 w-full rounded-2xl border-border"
            />
          </div>
        </div>

        {/* Categories - Responsive */}
        <div className="py-2 border-t border-border">
          <div className="flex items-center space-x-3 md:space-x-6 text-xs md:text-sm overflow-x-auto">
            <Link href="/products" className="text-muted-foreground hover:text-primary whitespace-nowrap">
              Semua Produk
            </Link>
            <Link href="/products?category=printer" className="text-muted-foreground hover:text-primary whitespace-nowrap">
              Printer
            </Link>
            <Link href="/products?category=fotocopy" className="text-muted-foreground hover:text-primary whitespace-nowrap">
              Fotocopy
            </Link>
            <Link href="/products?category=komputer" className="text-muted-foreground hover:text-primary whitespace-nowrap">
              Komputer
            </Link>
            <Link href="/service/request" className="text-secondary hover:text-secondary/80 font-medium whitespace-nowrap">
              Servis
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
