'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck } from 'lucide-react';

interface Order {
  _id: string;
  orderCode: string;
  userId: any; // Could be ObjectId or populated object
  items: Array<{
    productId: any;
    nameSnapshot: string;
    priceSnapshot: number;
    weightSnapshot?: number;
    qty: number;
    subtotal: number;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  shippingAddress: any; // Could be string or object
  shippingCourier?: string;
  shippingService?: string;
  shippingEstimate?: string;
  paymentMethod: string;
  paymentProof?: string;
  paymentProofUploadedAt?: string;
  adminNotes?: string;
  trackingNumber?: string;
  courier?: string;
  shippedAt?: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingData, setTrackingData] = useState({
    trackingNumber: '',
    courier: ''
  });
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        console.error('Failed to fetch orders:', response.status);
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      console.log('Orders data:', data);
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchOrders();
        alert(`Status berhasil diubah ke ${status}`);
      } else {
        alert('Gagal mengubah status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Terjadi kesalahan');
    }
  };

  const handleShipping = (order: Order) => {
    setShippingOrder(order);
    setTrackingData({ trackingNumber: '', courier: 'JNE' });
    setIsTrackingDialogOpen(true);
  };

  const handleAddTracking = (order: Order) => {
    setSelectedOrder(order);
    setIsTrackingDialogOpen(true);
  };

  const handleSubmitTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingOrder) return;

    try {
      const response = await fetch(`/api/admin/orders/${shippingOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'shipped',
          trackingNumber: trackingData.trackingNumber,
          courier: trackingData.courier,
          shippedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        fetchOrders();
        setIsTrackingDialogOpen(false);
        setTrackingData({ trackingNumber: '', courier: '' });
        setShippingOrder(null);
        alert('Resi berhasil diinput, status berubah ke "Dalam Pengiriman"');
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding tracking:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'outline',
      paid: 'secondary',
      processed: 'secondary',
      shipped: 'default',
      done: 'default',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Kelola Orders</h1>
        <p className="text-muted-foreground">Kelola pesanan customer</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada orders</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Ongkir</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Ekspedisi</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order.orderCode}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {typeof order.userId === 'object' && order.userId?.name 
                            ? order.userId.name 
                            : 'Customer'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {typeof order.userId === 'object' && order.userId?.email 
                            ? order.userId.email 
                            : 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.items?.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.nameSnapshot || 'Product'} x{item.qty || 0}
                          {item.weightSnapshot && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({item.weightSnapshot}g)
                            </span>
                          )}
                        </div>
                      )) || 'No items'}
                    </TableCell>
                    <TableCell>Rp {order.subtotal?.toLocaleString() || 0}</TableCell>
                    <TableCell>Rp {order.shippingCost?.toLocaleString() || 0}</TableCell>
                    <TableCell>Rp {order.total?.toLocaleString()}</TableCell>
                    <TableCell>
                      {order.shippingCourier ? (
                        <div className="text-sm">
                          <div className="font-medium">{order.shippingCourier}</div>
                          {order.shippingEstimate && (
                            <div className="text-xs text-muted-foreground">
                              {order.shippingEstimate}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={order.paymentMethod === 'cod' ? 'secondary' : 'outline'}>
                        {order.paymentMethod === 'transfer' ? 'Transfer' : 
                         order.paymentMethod === 'cod' ? 'COD' : order.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      {order.paymentProof ? (
                        <div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                Lihat Bukti
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Bukti Transfer - {order.orderCode}</DialogTitle>
                                <DialogDescription>
                                  Upload: {order.paymentProofUploadedAt ? 
                                    new Date(order.paymentProofUploadedAt).toLocaleString('id-ID') : 
                                    'Tidak diketahui'
                                  }
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4">
                                <div className="text-center p-8 bg-gray-50 rounded-lg">
                                  <p className="text-gray-500">Bukti pembayaran tidak tersedia</p>
                                  <p className="text-sm text-gray-400 mt-2">File mungkin sudah dihapus atau dipindahkan</p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Belum upload</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {/* 1. Pending - Waiting for payment */}
                        {order.status === 'pending' && !order.paymentProof && (
                          <Badge variant="outline" className="text-orange-600">
                            Menunggu Pembayaran
                          </Badge>
                        )}

                        {/* 2. Payment uploaded - Need admin verification */}
                        {order.status === 'pending' && order.paymentProof && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order._id, 'confirmed')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              ✓ Approve Payment
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateOrderStatus(order._id, 'payment_rejected')}
                            >
                              ✗ Reject Payment
                            </Button>
                          </>
                        )}

                        {/* 3. Payment confirmed - Ready to process */}
                        {order.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateOrderStatus(order._id, 'processing')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            📦 Mulai Kemas
                          </Button>
                        )}

                        {/* 4. Processing - Ready to ship */}
                        {order.status === 'processing' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleShipping(order)}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            🚚 Input Resi
                          </Button>
                        )}

                        {/* 5. Shipped - Waiting delivery */}
                        {order.status === 'shipped' && (
                          <div className="flex flex-col gap-1">
                            <Badge variant="default" className="bg-blue-500">
                              Dalam Pengiriman
                            </Badge>
                            {order.trackingNumber && (
                              <span className="text-xs text-muted-foreground">
                                {order.courier}: {order.trackingNumber}
                              </span>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateOrderStatus(order._id, 'delivered')}
                              className="mt-1"
                            >
                              ✓ Tandai Terkirim
                            </Button>
                          </div>
                        )}

                        {/* 6. Delivered - Auto close in 3 days */}
                        {order.status === 'delivered' && (
                          <div className="flex flex-col gap-1">
                            <Badge variant="default" className="bg-green-500">
                              Terkirim
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Auto close dalam 3 hari
                            </span>
                          </div>
                        )}

                        {/* 7. Completed */}
                        {order.status === 'completed' && (
                          <Badge variant="default" className="bg-green-600">
                            Selesai
                          </Badge>
                        )}

                        {/* 8. Cancelled/Rejected */}
                        {(order.status === 'cancelled' || order.status === 'payment_rejected') && (
                          <Badge variant="destructive">
                            {order.status === 'payment_rejected' ? 'Pembayaran Ditolak' : 'Dibatalkan'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                          <span className="text-xs text-muted-foreground">Menunggu bukti bayar</span>
                        )}
                        
                        {/* Verifikasi Pembayaran - untuk order dengan bukti bayar yang belum diverifikasi */}
                        {order.status === 'pending' && order.paymentMethod === 'transfer' && order.paymentProof && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'paid')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              ✓ Verifikasi Bayar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const reason = prompt('Alasan penolakan:');
                                if (reason) {
                                  // Update dengan admin notes
                                  fetch(`/api/admin/orders/${order._id}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ 
                                      adminNotes: `Bukti pembayaran ditolak: ${reason}`,
                                      paymentProof: null,
                                      paymentProofUploadedAt: null
                                    }),
                                  }).then(() => fetchOrders());
                                }
                              }}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              ✗ Tolak
                            </Button>
                          </div>
                        )}
                        
                        {order.status === 'paid' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order._id, 'processed')}
                          >
                            Proses Pesanan
                          </Button>
                        )}
                        
                        {order.status === 'pending' && order.paymentMethod === 'cod' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order._id, 'processed')}
                          >
                            Proses COD
                          </Button>
                        )}
                        
                        {order.status === 'processed' && (
                          <Button
                            size="sm"
                            onClick={() => handleAddTracking(order)}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Input Resi
                          </Button>
                        )}
                        
                        {order.status === 'shipped' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order._id, 'done')}
                          >
                            Selesai
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Tracking Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Input Resi Pengiriman</DialogTitle>
            <DialogDescription>
              Masukkan nomor resi dan kurir untuk order {selectedOrder?.orderCode}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTracking} className="space-y-4">
            <div>
              <Label htmlFor="courier">Kurir</Label>
              <Select 
                value={trackingData.courier} 
                onValueChange={(value) => setTrackingData({...trackingData, courier: value})}
              >
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Pilih kurir" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="JNE">JNE</SelectItem>
                  <SelectItem value="TIKI">TIKI</SelectItem>
                  <SelectItem value="POS">POS Indonesia</SelectItem>
                  <SelectItem value="J&T">J&T Express</SelectItem>
                  <SelectItem value="SiCepat">SiCepat</SelectItem>
                  <SelectItem value="AnterAja">AnterAja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="trackingNumber">Nomor Resi</Label>
              <Input
                id="trackingNumber"
                value={trackingData.trackingNumber}
                onChange={(e) => setTrackingData({...trackingData, trackingNumber: e.target.value})}
                className="rounded-2xl"
                placeholder="Masukkan nomor resi"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="rounded-2xl">
                Simpan
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsTrackingDialogOpen(false)} 
                className="rounded-2xl"
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
