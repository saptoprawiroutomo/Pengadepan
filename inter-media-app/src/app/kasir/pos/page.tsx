'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, Trash2, ShoppingCart, Printer } from 'lucide-react';

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
  const [selectedProductId, setSelectedProductId] = useState('');
  const [items, setItems] = useState<POSItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

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
        setProducts(data.filter((p: Product) => p.stock > 0));
      } else {
        console.error('Products data is not an array:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

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
      alert('Tambahkan produk terlebih dahulu');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/pos/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(item => ({
            productId: item.productId,
            qty: item.qty
          }))
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Transaksi berhasil!');
        
        // Print receipt
        const printWindow = window.open(`/api/pos/receipt/${result.transaction._id}`, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
        
        // Reset form
        setItems([]);
        fetchProducts(); // Refresh stock
      } else {
        alert(result.error || 'Gagal memproses transaksi');
      }
    } catch (error) {
      alert('Terjadi kesalahan');
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
      <h1 className="text-2xl font-bold mb-6">POS - Point of Sale</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Selection */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Tambah Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="flex-1 rounded-2xl">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.name} - Rp {product.price.toLocaleString('id-ID')} (Stok: {product.stock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addItem} disabled={!selectedProductId} className="rounded-2xl">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Summary */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Total Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                Rp {calculateTotal().toLocaleString('id-ID')}
              </p>
              <p className="text-muted-foreground">
                {items.length} item(s)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Items */}
      <Card className="rounded-2xl mt-6">
        <CardHeader>
          <CardTitle>Daftar Belanja</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingCart className="h-16 w-16 mx-auto mb-4" />
              <p>Belum ada produk ditambahkan</p>
            </div>
          ) : (
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
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.product.categoryId.name}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>Rp {item.product.price.toLocaleString('id-ID')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.qty - 1)}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-center rounded-2xl"
                          min="1"
                          max={item.product.stock}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.productId, item.qty + 1)}
                          disabled={item.qty >= item.product.stock}
                          className="h-8 w-8 p-0 rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                        className="rounded-2xl"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
    </div>
  );
}
