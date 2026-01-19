'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, TrendingUp, Package, Wrench } from 'lucide-react';

export default function ReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [salesData, setSalesData] = useState<any>(null);
  const [servicesData, setServicesData] = useState<any>(null);
  const [stockData, setStockData] = useState<any>(null);
  const [topProductsData, setTopProductsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    
    if (session.user.role !== 'admin') {
      router.push('/');
      return;
    }

    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);

    fetchAllReports();
  }, [session, router]);

  const fetchAllReports = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [salesRes, servicesRes, stockRes, topProductsRes] = await Promise.all([
        fetch(`/api/reports/sales?${params}`),
        fetch(`/api/reports/services?${params}`),
        fetch('/api/reports/stock'),
        fetch('/api/reports/top-products')
      ]);

      if (salesRes.ok) setSalesData(await salesRes.json());
      if (servicesRes.ok) setServicesData(await servicesRes.json());
      if (stockRes.ok) setStockData(await stockRes.json());
      if (topProductsRes.ok) setTopProductsData(await topProductsRes.json());
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToPDF = async (reportType: string, data: any) => {
    try {
      const dateRange = startDate && endDate 
        ? `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`
        : 'Semua Data';

      const response = await fetch('/api/reports/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType, data, dateRange }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-${reportType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      alert('Gagal export PDF');
    }
  };

  if (!session || session.user.role !== 'admin') {
    return <div className="container mx-auto px-4 py-8">Unauthorized</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Laporan</h1>
        
        {/* Date Filter */}
        <div className="flex gap-2 items-center">
          <Label htmlFor="startDate">Dari:</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-auto rounded-2xl"
          />
          <Label htmlFor="endDate">Sampai:</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-auto rounded-2xl"
          />
          <Button onClick={fetchAllReports} disabled={isLoading} className="rounded-2xl">
            <Calendar className="mr-2 h-4 w-4" />
            {isLoading ? 'Loading...' : 'Filter'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
          <TabsTrigger value="services">Servis</TabsTrigger>
          <TabsTrigger value="stock">Stok</TabsTrigger>
          <TabsTrigger value="top-products">Produk Terlaris</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Laporan Penjualan</h2>
              <Button 
                onClick={() => exportToPDF('Penjualan', salesData)} 
                disabled={!salesData}
                className="rounded-2xl"
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>

            {salesData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{salesData.summary.totalTransactions}</p>
                          <p className="text-sm text-muted-foreground">Total Transaksi</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">Rp {salesData.summary.totalRevenue.toLocaleString('id-ID')}</p>
                          <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">{salesData.summary.posTransactions}</p>
                          <p className="text-sm text-muted-foreground">Transaksi POS</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold">{salesData.summary.onlineOrders}</p>
                          <p className="text-sm text-muted-foreground">Order Online</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Penjualan Harian</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Jumlah Transaksi</TableHead>
                          <TableHead>Total Penjualan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {salesData.dailySales.map((day: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{day._id.day}/{day._id.month}/{day._id.year}</TableCell>
                            <TableCell>{day.transactionCount}</TableCell>
                            <TableCell>Rp {day.totalSales.toLocaleString('id-ID')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Services Report */}
        <TabsContent value="services">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Laporan Servis</h2>
              <Button 
                onClick={() => exportToPDF('Servis', servicesData)} 
                disabled={!servicesData}
                className="rounded-2xl"
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>

            {servicesData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Wrench className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{servicesData.summary.totalServices}</p>
                          <p className="text-sm text-muted-foreground">Total Servis</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">Rp {servicesData.summary.totalRevenue.toLocaleString('id-ID')}</p>
                          <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">Rp {Math.round(servicesData.summary.avgCost).toLocaleString('id-ID')}</p>
                          <p className="text-sm text-muted-foreground">Rata-rata Biaya</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Servis per Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {servicesData.servicesByStatus.map((status: any) => (
                          <div key={status._id} className="flex justify-between items-center">
                            <span className="capitalize">{status._id}</span>
                            <Badge variant="secondary">{status.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Servis per Perangkat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {servicesData.servicesByDevice.map((device: any) => (
                          <div key={device._id} className="flex justify-between items-center">
                            <span className="capitalize">{device._id}</span>
                            <Badge variant="secondary">{device.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        {/* Stock Report */}
        <TabsContent value="stock">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Laporan Stok</h2>
              <Button 
                onClick={() => exportToPDF('Stok', stockData)} 
                disabled={!stockData}
                className="rounded-2xl"
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>

            {stockData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{stockData.summary.totalProducts}</p>
                          <p className="text-sm text-muted-foreground">Total Produk</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">{stockData.summary.totalStock}</p>
                          <p className="text-sm text-muted-foreground">Total Stok</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-red-600" />
                        <div>
                          <p className="text-2xl font-bold">{stockData.summary.outOfStock}</p>
                          <p className="text-sm text-muted-foreground">Stok Habis</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-yellow-600" />
                        <div>
                          <p className="text-2xl font-bold">{stockData.summary.lowStock}</p>
                          <p className="text-sm text-muted-foreground">Stok Menipis</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Detail Stok Produk</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Produk</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Stok</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockData.stockReport.slice(0, 20).map((product: any) => (
                          <TableRow key={product._id}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.categoryName}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  product.stockStatus === 'out_of_stock' ? 'destructive' :
                                  product.stockStatus === 'low_stock' ? 'secondary' : 'default'
                                }
                              >
                                {product.stockStatus === 'out_of_stock' ? 'Habis' :
                                 product.stockStatus === 'low_stock' ? 'Menipis' : 'Tersedia'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Top Products Report */}
        <TabsContent value="top-products">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Laporan Produk Terlaris</h2>
              <Button 
                onClick={() => exportToPDF('Produk-Terlaris', topProductsData)} 
                disabled={!topProductsData}
                className="rounded-2xl"
              >
                <Download className="mr-2 h-4 w-4" />
                Export PDF
              </Button>
            </div>

            {topProductsData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{topProductsData.summary.totalProductsSold}</p>
                          <p className="text-sm text-muted-foreground">Total Terjual</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">Rp {topProductsData.summary.totalRevenue.toLocaleString('id-ID')}</p>
                          <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Package className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">{topProductsData.summary.productsWithSales}</p>
                          <p className="text-sm text-muted-foreground">Produk Terjual</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Top 20 Produk Terlaris</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ranking</TableHead>
                          <TableHead>Produk</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Terjual</TableHead>
                          <TableHead>Pendapatan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topProductsData.topProducts.map((product: any, index: number) => (
                          <TableRow key={product._id}>
                            <TableCell>
                              <Badge variant={index < 3 ? "default" : "secondary"}>
                                #{index + 1}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.categoryName}</TableCell>
                            <TableCell>{product.soldCount}</TableCell>
                            <TableCell>Rp {product.revenue.toLocaleString('id-ID')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
