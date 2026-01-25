'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Trash2, ShoppingCart, Printer, BarChart3 } from 'lucide-react';
import ReceiptPopup from '@/components/pos/ReceiptPopup';
import { toast } from 'sonner';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  categoryId: { name: string };
}

interface POSItem {
  productId: string;
  product: Product;
  qty: number;
  subtotal: number;
}

export default function POSPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [items, setItems] = useState<POSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  useEffect(() => {
    if (!session) return;
    
    if (!['admin', 'kasir'].includes(session.user.role)) {
      router.push('/');
      return;
    }

    fetchProducts();
  }, [session, router]);

  const fetchProducts = async () => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/admin/products');
      
      if (!response.ok) {
        console.error('Failed to fetch products:', response.status);
        setProducts([]);
        return;
      }
      
      const data = await response.json();
      
      // Handle error response
      if (data.error) {
        console.error('Products API error:', data.error);
        setProducts([]);
        return;
      }
      
      // Handle successful response
      if (Array.isArray(data)) {
        const availableProducts = data.filter((p: Product) => p.stock > 0);
        setProducts(availableProducts);
        setFilteredProducts(availableProducts);
      } else {
        console.error('Products data is not an array:', data);
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const addItem = () => {
    if (!selectedProductId) return;

    const product = products.find(p => p._id === selectedProductId);
    if (!product) return;

    const existingItemIndex = items.findIndex(item => item.productId === selectedProductId);
    
    if (existingItemIndex >= 0) {
      const newItems = [...items];
      if (newItems[existingItemIndex].qty < product.stock) {
        newItems[existingItemIndex].qty += 1;
        newItems[existingItemIndex].subtotal = newItems[existingItemIndex].qty * product.price;
        setItems(newItems);
      }
    } else {
      const newItem: POSItem = {
        productId: selectedProductId,
        product,
        qty: 1,
        subtotal: product.price
      };
      setItems([...items, newItem]);
    }
    
    setSelectedProductId('');
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      removeItem(productId);
      return;
    }

    const newItems = items.map(item => {
      if (item.productId === productId) {
        const maxQty = Math.min(newQty, item.product.stock);
        return {
          ...item,
          qty: maxQty,
          subtotal: maxQty * item.product.price
        };
      }
      return item;
    });
    setItems(newItems);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0);
  };

  const processTransaction = async () => {
    if (items.length === 0) {
      toast('Tambahkan produk terlebih dahulu');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/pos/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          items: items.map(item => ({
            productId: item.productId,
            qty: item.qty
          }))
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Fetch receipt data
        const receiptResponse = await fetch(`/api/pos/receipt/${result.transaction._id}`);
        if (receiptResponse.ok) {
          const receiptData = await receiptResponse.json();
          setReceiptData(receiptData);
          setShowReceipt(true);
        }
        
        // Reset form
        setItems([]);
        setCustomerName('');
        fetchProducts(); // Refresh stock
      } else {
        alert(result.error || 'Gagal memproses transaksi');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!session || !['admin', 'kasir'].includes(session.user.role)) {
    return <div className="container mx-auto px-4 py-8">Unauthorized</div>;
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">POS - Point of Sale</h1>
        <Button variant="outline" asChild className="rounded-2xl">
          <Link href="/admin/reports">
            <BarChart3 className="mr-2 h-4 w-4" />
            Laporan Penjualan
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Informasi Pembeli</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerName">Nama Pembeli</Label>
                <Input
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Masukkan nama pembeli"
                  className="rounded-2xl"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Tanggal:</strong> {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</p>
                <p><strong>Kasir:</strong> {session?.user?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Selection */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Tambah Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="searchProduct">Cari Produk</Label>
                <Input
                  id="searchProduct"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ketik nama produk..."
                  className="rounded-2xl"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger className="flex-1 rounded-2xl">
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts.map((product) => (
                      <SelectItem key={product._id} value={product._id}>
                        <div className="flex justify-between items-center w-full">
                          <span className="truncate max-w-[200px]">{product.name}</span>
                          <span className="ml-2 text-sm text-gray-500">
                            Rp {product.price.toLocaleString('id-ID')} (Stok: {product.stock})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={addItem} 
                  disabled={!selectedProductId} 
                  className="rounded-2xl px-4 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shopping Cart */}
      <Card className="rounded-2xl mt-6">
        <CardHeader>
          <CardTitle>Keranjang Belanja</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4" />
              <p>Belum ada produk ditambahkan</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produk</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.product.name}</TableCell>
                      <TableCell>Rp {item.product.price.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.qty - 1)}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.qty}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.qty + 1)}
                            className="h-8 w-8 p-0 rounded-full"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>Rp {item.subtotal.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(item.productId)}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    Total: Rp {calculateTotal().toLocaleString('id-ID')}
                  </p>
                  <p className="text-muted-foreground">
                    {items.length} item(s)
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Process Transaction */}
      {items.length > 0 && (
        <div className="mt-6 flex justify-end">
          <Button
            onClick={processTransaction}
            disabled={isProcessing}
            size="lg"
            className="rounded-2xl"
          >
            <Printer className="mr-2 h-5 w-5" />
            {isProcessing ? 'Memproses...' : 'Proses & Cetak Struk'}
          </Button>
        </div>
      )}

      {/* Receipt Popup */}
      <ReceiptPopup
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        receiptData={receiptData}
      />
    </div>
  );
}
