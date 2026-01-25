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
import { FileText, Calendar, TrendingUp, Package, Wrench, FileSpreadsheet, Printer, Truck, ShoppingCart, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Initialize with null to use API data
  const [salesData, setSalesData] = useState<any>(null);
  
  const [servicesData, setServicesData] = useState<any>(null);
  const [stockData, setStockData] = useState<any>(null);
  const [topProductsData, setTopProductsData] = useState<any>(null);
  const [shippingData, setShippingData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);
  const [paymentsData, setPaymentsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Temporarily disable auth check for debugging
    // if (!session) return;
    
    // if (!['admin', 'kasir'].includes(session.user.role)) {
    //   router.push('/');
    //   return;
    // }

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

      console.log('Frontend sending params:', { startDate, endDate });
      console.log('API URL:', `/api/reports/sales?${params}`);

      const [salesRes, servicesRes, stockRes, topProductsRes, shippingRes, ordersRes, paymentsRes] = await Promise.all([
        fetch(`/api/reports/sales?${params}&_t=${Date.now()}`), // Add cache buster
        fetch(`/api/reports/services?${params}`),
        fetch('/api/reports/stock'),
        fetch('/api/reports/top-products'),
        fetch(`/api/reports/shipping?${params}`),
        fetch(`/api/reports/orders?${params}`),
        fetch(`/api/reports/payments?${params}`)
      ]);

      if (salesRes.ok) {
        const salesResult = await salesRes.json();
        console.log('Sales data received:', salesResult);
        console.log('Summary:', salesResult.summary);
        setSalesData(salesResult);
      } else {
        console.error('Sales API error:', salesRes.status);
      }
      if (servicesRes.ok) setServicesData(await servicesRes.json());
      if (stockRes.ok) setStockData(await stockRes.json());
      if (topProductsRes.ok) setTopProductsData(await topProductsRes.json());
      if (shippingRes.ok) setShippingData(await shippingRes.json());
      if (ordersRes.ok) setOrdersData(await ordersRes.json());
      if (paymentsRes.ok) setPaymentsData(await paymentsRes.json());
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      toast.loading('Mengexport data...', { id: 'export-excel' });
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/reports/export-excel?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-penjualan-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('File Excel berhasil didownload', { id: 'export-excel' });
      } else {
        toast.error('Gagal export Excel', { id: 'export-excel' });
      }
    } catch (error) {
      toast.error('Gagal export Excel', { id: 'export-excel' });
    }
  };

  const exportStockToExcel = async () => {
    try {
      toast.loading('Mengexport data stok...', { id: 'export-stock' });
      
      const response = await fetch('/api/reports/export-stock');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-stok-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('File Excel berhasil didownload', { id: 'export-stock' });
      } else {
        toast.error('Gagal export Excel', { id: 'export-stock' });
      }
    } catch (error) {
      toast.error('Gagal export Excel', { id: 'export-stock' });
    }
  };

  const exportServicesToExcel = async () => {
    try {
      toast.loading('Mengexport data servis...', { id: 'export-services' });
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/reports/export-services?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-servis-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('File Excel berhasil didownload', { id: 'export-services' });
      } else {
        toast.error('Gagal export Excel', { id: 'export-services' });
      }
    } catch (error) {
      toast.error('Gagal export Excel', { id: 'export-services' });
    }
  };

  const exportTopProductsToExcel = async () => {
    try {
      toast.loading('Mengexport data produk terlaris...', { id: 'export-top-products' });
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/reports/export-top-products?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-produk-terlaris-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('File Excel berhasil didownload', { id: 'export-top-products' });
      } else {
        toast.error('Gagal export Excel', { id: 'export-top-products' });
      }
    } catch (error) {
      toast.error('Gagal export Excel', { id: 'export-top-products' });
    }
  };

  const exportShippingToExcel = async () => {
    try {
      toast.loading('Mengexport data pengiriman...', { id: 'export-shipping' });
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/reports/export-shipping?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-pengiriman-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('File Excel berhasil didownload', { id: 'export-shipping' });
      } else {
        toast.error('Gagal export Excel', { id: 'export-shipping' });
      }
    } catch (error) {
      toast.error('Gagal export Excel', { id: 'export-shipping' });
    }
  };

  const exportOrdersToExcel = async () => {
    try {
      toast.loading('Mengexport data pemesanan...', { id: 'export-orders' });
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/reports/export-orders?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-pemesanan-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('File Excel berhasil didownload', { id: 'export-orders' });
      } else {
        toast.error('Gagal export Excel', { id: 'export-orders' });
      }
    } catch (error) {
      toast.error('Gagal export Excel', { id: 'export-orders' });
    }
  };

  const exportPaymentsToExcel = async () => {
    try {
      toast.loading('Mengexport data pembayaran...', { id: 'export-payments' });
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/reports/export-payments?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan-pembayaran-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success('File Excel berhasil didownload', { id: 'export-payments' });
      } else {
        toast.error('Gagal export Excel', { id: 'export-payments' });
      }
    } catch (error) {
      toast.error('Gagal export Excel', { id: 'export-payments' });
    }
  };

  if (!session || session.user.role !== 'admin') {
    return null;
  }

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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="sales">Penjualan</TabsTrigger>
          <TabsTrigger value="services">Servis</TabsTrigger>
          <TabsTrigger value="stock">Stok</TabsTrigger>
          <TabsTrigger value="top-products">Produk Terlaris</TabsTrigger>
          <TabsTrigger value="shipping">Pengiriman</TabsTrigger>
          <TabsTrigger value="orders">Pemesanan</TabsTrigger>
          <TabsTrigger value="payments">Pembayaran</TabsTrigger>
        </TabsList>

        {/* Sales Report */}
        <TabsContent value="sales">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Laporan Penjualan</h2>
              <div className="flex gap-2">
                <Button onClick={exportToExcel} className="rounded-2xl">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (startDate) params.append('startDate', startDate);
                    if (endDate) params.append('endDate', endDate);
                    window.open(`/api/reports/print-sales?${params}`, '_blank');
                  }} 
                  className="rounded-2xl"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            {salesData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{salesData?.summary?.totalTransactions || 0}</p>
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
                          <p className="text-2xl font-bold">Rp {(salesData?.summary?.totalRevenue || 0).toLocaleString('id-ID')}</p>
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
                          <p className="text-2xl font-bold">{salesData?.summary?.posTransactions || 0}</p>
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
                          <p className="text-2xl font-bold">{salesData?.summary?.onlineTransactions || 0}</p>
                          <p className="text-sm text-muted-foreground">Transaksi Online</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* POS vs Online Comparison */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Transaksi POS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Transaksi:</span>
                          <span className="font-semibold">{salesData?.summary?.posTransactions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Pendapatan:</span>
                          <span className="font-semibold">Rp {(salesData?.summary?.posRevenue || 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rata-rata Order:</span>
                          <span className="font-semibold">Rp {(salesData?.summary?.posAverage || 0).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Transaksi Online</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span>Total Transaksi:</span>
                          <span className="font-semibold">{salesData?.summary?.onlineTransactions || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Pendapatan:</span>
                          <span className="font-semibold">Rp {(salesData?.summary?.onlineRevenue || 0).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rata-rata Order:</span>
                          <span className="font-semibold">Rp {(salesData?.summary?.onlineAverage || 0).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Daily Sales Chart */}
                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Penjualan Harian</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>POS</TableHead>
                          <TableHead>Online</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(salesData?.dailySales || []).map((day: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{day.date || 'N/A'}</TableCell>
                            <TableCell>Rp {(day.posSales || 0).toLocaleString('id-ID')}</TableCell>
                            <TableCell>Rp {(day.onlineSales || 0).toLocaleString('id-ID')}</TableCell>
                            <TableCell className="font-semibold">Rp {(day.totalSales || 0).toLocaleString('id-ID')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Separate POS and Online Transactions */}
                <Tabs defaultValue="pos-transactions" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="pos-transactions">Transaksi POS</TabsTrigger>
                    <TabsTrigger value="online-transactions">Transaksi Online</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pos-transactions">
                    <Card className="rounded-2xl">
                      <CardHeader>
                        <CardTitle>Detail Transaksi POS</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Kode Transaksi</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Kasir</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(salesData?.posTransactions || []).map((transaction: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-mono">
                                  {transaction.transactionCode || `POS-${transaction._id?.toString().slice(-6)}`}
                                </TableCell>
                                <TableCell>
                                  {new Date(transaction.createdAt).toLocaleDateString('id-ID')}
                                </TableCell>
                                <TableCell>{transaction.cashierName || 'Kasir'}</TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {(transaction.items || []).map((item: any, i: number) => (
                                      <div key={i} className="mb-1">
                                        {item.nameSnapshot || 'Product'} ({item.qty || item.quantity || 0}x)
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  Rp {(transaction.total || transaction.totalAmount || 0).toLocaleString('id-ID')}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="online-transactions">
                    <Card className="rounded-2xl">
                      <CardHeader>
                        <CardTitle>Detail Transaksi Online</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Order ID</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead>Customer</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Items</TableHead>
                              <TableHead>Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(salesData?.onlineTransactions || []).map((order: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell className="font-mono">
                                  {order.orderNumber || `ORD-${order._id?.toString().slice(-6)}`}
                                </TableCell>
                                <TableCell>
                                  {new Date(order.createdAt).toLocaleDateString('id-ID')}
                                </TableCell>
                                <TableCell>{order.customerName || order.userId?.name || 'Customer'}</TableCell>
                                <TableCell>
                                  <Badge variant={
                                    order.status === 'delivered' ? 'default' :
                                    order.status === 'shipped' ? 'secondary' :
                                    order.status === 'processing' ? 'outline' : 'destructive'
                                  }>
                                    {order.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {(order.items || []).map((item: any, i: number) => (
                                      <div key={i} className="mb-1">
                                        {item.nameSnapshot || item.name || 'Product'} ({item.quantity || 0}x)
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                  Rp {(order.totalAmount || 0).toLocaleString('id-ID')}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </TabsContent>

        {/* Services Report */}
        <TabsContent value="services">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Laporan Servis</h2>
              <div className="flex gap-2">
                <Button onClick={exportServicesToExcel} className="rounded-2xl">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (startDate) params.append('startDate', startDate);
                    if (endDate) params.append('endDate', endDate);
                    window.open(`/api/reports/print-services?${params}`, '_blank');
                  }} 
                  className="rounded-2xl"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
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
              <div className="flex gap-2">
                <Button onClick={exportStockToExcel} className="rounded-2xl">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/api/reports/print-stock', '_blank')} 
                  className="rounded-2xl"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
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
              <div className="flex gap-2">
                <Button onClick={exportTopProductsToExcel} className="rounded-2xl">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (startDate) params.append('startDate', startDate);
                    if (endDate) params.append('endDate', endDate);
                    window.open(`/api/reports/print-top-products?${params}`, '_blank');
                  }} 
                  className="rounded-2xl"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
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
                          <TableRow key={`product-${index}`}>
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

        {/* Shipping Report */}
        <TabsContent value="shipping">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Laporan Pengiriman</h2>
              <div className="flex gap-2">
                <Button onClick={exportShippingToExcel} className="rounded-2xl">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (startDate) params.append('startDate', startDate);
                    if (endDate) params.append('endDate', endDate);
                    window.open(`/api/reports/print-shipping?${params}`, '_blank');
                  }} 
                  className="rounded-2xl"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            {shippingData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{shippingData.summary?.totalShipments || 0}</p>
                          <p className="text-sm text-muted-foreground">Total Pengiriman</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">{shippingData.summary?.delivered || 0}</p>
                          <p className="text-sm text-muted-foreground">Terkirim</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <Truck className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">{shippingData.summary?.inTransit || 0}</p>
                          <p className="text-sm text-muted-foreground">Dalam Perjalanan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-8 w-8 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold">Rp {(shippingData.summary?.totalShippingCost || 0).toLocaleString('id-ID')}</p>
                          <p className="text-sm text-muted-foreground">Total Ongkir</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Detail Pengiriman</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Tanggal Kirim</TableHead>
                          <TableHead>Alamat Tujuan</TableHead>
                          <TableHead>Kurir</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Ongkir</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(shippingData.shipments || []).map((shipment: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">{shipment.orderNumber}</TableCell>
                            <TableCell>{new Date(shipment.shippedAt || shipment.createdAt).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell className="max-w-xs truncate">{shipment.shippingAddress}</TableCell>
                            <TableCell>{shipment.courier || 'JNE'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                shipment.status === 'done' ? 'default' :
                                shipment.status === 'shipped' ? 'secondary' : 'outline'
                              }>
                                {shipment.status === 'done' ? 'Terkirim' :
                                 shipment.status === 'shipped' ? 'Dikirim' : 'Diproses'}
                              </Badge>
                            </TableCell>
                            <TableCell>Rp {(shipment.shippingCost || 0).toLocaleString('id-ID')}</TableCell>
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

        {/* Orders Report */}
        <TabsContent value="orders">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Laporan Pemesanan</h2>
              <div className="flex gap-2">
                <Button onClick={exportOrdersToExcel} className="rounded-2xl">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (startDate) params.append('startDate', startDate);
                    if (endDate) params.append('endDate', endDate);
                    window.open(`/api/reports/print-orders?${params}`, '_blank');
                  }} 
                  className="rounded-2xl"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            {ordersData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{ordersData.summary?.totalOrders || 0}</p>
                          <p className="text-sm text-muted-foreground">Total Pesanan</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">{ordersData.summary?.completed || 0}</p>
                          <p className="text-sm text-muted-foreground">Selesai</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <ShoppingCart className="h-8 w-8 text-yellow-600" />
                        <div>
                          <p className="text-2xl font-bold">{ordersData.summary?.pending || 0}</p>
                          <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">Rp {(ordersData.summary?.avgOrderValue || 0).toLocaleString('id-ID')}</p>
                          <p className="text-sm text-muted-foreground">Rata-rata Nilai</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Pesanan per Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(ordersData.ordersByStatus || []).map((status: any) => (
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
                      <CardTitle>Pesanan Harian</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(ordersData.dailyOrders || []).slice(0, 7).map((day: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span>{day.date}</span>
                            <Badge variant="outline">{day.count} pesanan</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Detail Pesanan Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(ordersData.recentOrders || []).map((order: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">{order.orderNumber}</TableCell>
                            <TableCell>{new Date(order.createdAt).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>{order.customerName}</TableCell>
                            <TableCell>{order.itemCount} item</TableCell>
                            <TableCell>
                              <Badge variant={
                                order.status === 'done' ? 'default' :
                                order.status === 'shipped' ? 'secondary' :
                                order.status === 'processed' ? 'outline' : 'destructive'
                              }>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>Rp {(order.totalAmount || 0).toLocaleString('id-ID')}</TableCell>
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

        {/* Payments Report */}
        <TabsContent value="payments">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Laporan Pembayaran</h2>
              <div className="flex gap-2">
                <Button onClick={exportPaymentsToExcel} className="rounded-2xl">
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (startDate) params.append('startDate', startDate);
                    if (endDate) params.append('endDate', endDate);
                    window.open(`/api/reports/print-payments?${params}`, '_blank');
                  }} 
                  className="rounded-2xl"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>

            {paymentsData && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-2xl font-bold">{paymentsData.summary?.totalPayments || 0}</p>
                          <p className="text-sm text-muted-foreground">Total Pembayaran</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">{paymentsData.summary?.successful || 0}</p>
                          <p className="text-sm text-muted-foreground">Berhasil</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-8 w-8 text-red-600" />
                        <div>
                          <p className="text-2xl font-bold">{paymentsData.summary?.failed || 0}</p>
                          <p className="text-sm text-muted-foreground">Gagal</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="text-2xl font-bold">Rp {(paymentsData.summary?.totalAmount || 0).toLocaleString('id-ID')}</p>
                          <p className="text-sm text-muted-foreground">Total Nilai</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Metode Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(paymentsData.paymentMethods || []).map((method: any) => (
                          <div key={method._id} className="flex justify-between items-center">
                            <span className="capitalize">{method._id || 'Transfer Bank'}</span>
                            <div className="text-right">
                              <Badge variant="secondary">{method.count}</Badge>
                              <p className="text-sm text-muted-foreground">
                                Rp {(method.total || 0).toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle>Status Pembayaran</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {(paymentsData.paymentStatus || []).map((status: any) => (
                          <div key={status._id} className="flex justify-between items-center">
                            <span className="capitalize">{status._id}</span>
                            <Badge variant={
                              status._id === 'paid' ? 'default' :
                              status._id === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {status.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl">
                  <CardHeader>
                    <CardTitle>Transaksi Pembayaran Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Metode</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Jumlah</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(paymentsData.recentPayments || []).map((payment: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">{payment.orderNumber}</TableCell>
                            <TableCell>{new Date(payment.paidAt || payment.createdAt).toLocaleDateString('id-ID')}</TableCell>
                            <TableCell>{payment.customerName}</TableCell>
                            <TableCell>{payment.paymentMethod || 'Transfer Bank'}</TableCell>
                            <TableCell>
                              <Badge variant={
                                payment.paymentStatus === 'paid' ? 'default' :
                                payment.paymentStatus === 'pending' ? 'secondary' : 'destructive'
                              }>
                                {payment.paymentStatus === 'paid' ? 'Lunas' :
                                 payment.paymentStatus === 'pending' ? 'Pending' : 'Gagal'}
                              </Badge>
                            </TableCell>
                            <TableCell>Rp {(payment.totalAmount || 0).toLocaleString('id-ID')}</TableCell>
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
