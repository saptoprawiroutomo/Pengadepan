import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Wrench, Truck, Shield } from "lucide-react";

export default function Home() {
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
            <Button size="lg" className="rounded-2xl">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Belanja Sekarang
            </Button>
            <Button variant="outline" size="lg" className="rounded-2xl">
              <Wrench className="mr-2 h-5 w-5" />
              Request Servis
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

      {/* CTA Section */}
      <section className="bg-card rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Butuh Bantuan?</h2>
        <p className="text-muted-foreground mb-6">
          Tim customer service kami siap membantu Anda 24/7
        </p>
        <Button className="rounded-2xl">
          Hubungi Kami
        </Button>
      </section>
    </div>
  );
}
