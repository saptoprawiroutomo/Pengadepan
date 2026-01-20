import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src="/logo-im.svg" alt="Inter Medi-A" width={120} height={40} className="mb-4 h-10 w-auto" />
            <p className="text-muted-foreground text-sm">
              Solusi terpercaya untuk kebutuhan printer, fotocopy, dan komputer Anda.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Produk</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products?category=printer" className="hover:text-primary">Printer</Link></li>
              <li><Link href="/products?category=fotocopy" className="hover:text-primary">Fotocopy</Link></li>
              <li><Link href="/products?category=komputer" className="hover:text-primary">Komputer</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Layanan</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/service/request" className="hover:text-primary">Servis Perangkat</Link></li>
              <li><Link href="/orders" className="hover:text-primary">Lacak Pesanan</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Bantuan</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/profile" className="hover:text-primary">Akun Saya</Link></li>
              <li><Link href="/cart" className="hover:text-primary">Keranjang</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Inter Medi-A. Pembuat Sapto Prawiro Utomo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
