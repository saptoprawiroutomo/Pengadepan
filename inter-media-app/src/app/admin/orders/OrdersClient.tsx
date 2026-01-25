'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Order {
  _id: string;
  orderCode: string;
  userId: any;
  items: Array<{
    productId: any;
    nameSnapshot: string;
    priceSnapshot: number;
    qty: number;
    subtotal: number;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  status: string;
  shippingAddress: any;
  paymentMethod: string;
  paymentProof?: string;
  trackingNumber?: string;
  courier?: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [shippingOrder, setShippingOrder] = useState<Order | null>(null);
  const [trackingData, setTrackingData] = useState({
    trackingNumber: '',
    courier: 'JNE'
  });

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        console.error('Failed to fetch orders:', response.status);
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    console.log('Updating order:', orderId, 'to status:', status);
    
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Update result:', result);
        fetchOrders();
        toast.success(`Status berhasil diubah ke ${status}`);
      } else {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        toast.error(`Gagal mengubah status: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Terjadi kesalahan saat mengubah status');
    }
  };

  const handleShipping = (order: Order) => {
    setShippingOrder(order);
    // Use courier from order instead of defaulting to JNE
    const orderCourier = order.courier || 'JNE';
    setTrackingData({ trackingNumber: '', courier: orderCourier });
    setIsTrackingDialogOpen(true);
  };

  const handleSubmitTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shippingOrder) return;

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: shippingOrder._id,
          status: 'shipped',
          trackingNumber: trackingData.trackingNumber,
          courier: trackingData.courier,
          shippedAt: new Date().toISOString()
        }),
      });

      if (response.ok) {
        fetchOrders();
        setIsTrackingDialogOpen(false);
        setTrackingData({ trackingNumber: '', courier: 'JNE' });
        setShippingOrder(null);
        toast.success('Resi berhasil diinput, status berubah ke "Dalam Pengiriman"');
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding tracking:', error);
      toast.error('Terjadi kesalahan');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-orange-100 text-orange-800' },
      confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
      processing: { label: 'Processing', color: 'bg-purple-100 text-purple-800' },
      shipped: { label: 'Shipped', color: 'bg-blue-100 text-blue-800' },
      delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
      payment_rejected: { label: 'Payment Rejected', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <span className={`px-2 py-1 rounded-full text-xs ${config.color}`}>{config.label}</span>;
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Kelola Orders</CardTitle>
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
                  <TableHead>Kurir</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
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
                        </div>
                      )) || 'No items'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{order.courier || 'Belum dipilih'}</div>
                        <div className="text-muted-foreground">
                          Rp {order.shippingCost?.toLocaleString() || '0'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Rp {order.total?.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.paymentMethod === 'cod' ? 'bg-green-100 text-green-800' : 
                        order.paymentMethod === 'ovo' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.paymentMethod === 'transfer' ? 'Transfer' : 
                         order.paymentMethod === 'cod' ? 'COD' : 
                         order.paymentMethod === 'ovo' ? 'OVO' : order.paymentMethod}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2 flex-wrap">
                        {/* Pending - Waiting for payment */}
                        {order.status === 'pending' && !order.paymentProof && order.paymentMethod !== 'ovo' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                            Menunggu Pembayaran
                          </span>
                        )}

                        {/* OVO Payment - Need manual verification */}
                        {order.status === 'pending' && order.paymentMethod === 'ovo' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                console.log('Approve OVO payment for order:', order._id);
                                updateOrderStatus(order._id, 'confirmed');
                              }}
                              className="rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100"
                            >
                              ✓ Konfirmasi OVO
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                console.log('Reject OVO payment for order:', order._id);
                                updateOrderStatus(order._id, 'payment_rejected');
                              }}
                              className="rounded-2xl text-red-600 hover:text-red-700"
                            >
                              ✗ Tolak OVO
                            </Button>
                          </>
                        )}

                        {/* Transfer Payment uploaded - Need admin verification */}
                        {order.status === 'pending' && order.paymentProof && order.paymentMethod !== 'ovo' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                console.log('Approve button clicked for order:', order._id);
                                updateOrderStatus(order._id, 'confirmed');
                              }}
                              className="rounded-2xl"
                            >
                              ✓ Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.preventDefault();
                                console.log('Reject button clicked for order:', order._id);
                                updateOrderStatus(order._id, 'payment_rejected');
                              }}
                              className="rounded-2xl text-red-600 hover:text-red-700"
                            >
                              ✗ Reject
                            </Button>
                          </>
                        )}

                        {/* Payment confirmed - Ready to process */}
                        {order.status === 'confirmed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateOrderStatus(order._id, 'processing')}
                            className="rounded-2xl"
                          >
                            📦 Mulai Kemas
                          </Button>
                        )}

                        {/* Processing - Ready to ship */}
                        {order.status === 'processing' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleShipping(order)}
                            className="rounded-2xl"
                          >
                            🚚 Input Resi
                          </Button>
                        )}

                        {/* Shipped - Waiting delivery */}
                        {order.status === 'shipped' && (
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              Dalam Pengiriman
                            </span>
                            {order.trackingNumber && (
                              <span className="text-xs text-muted-foreground">
                                {order.courier}: {order.trackingNumber}
                              </span>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateOrderStatus(order._id, 'delivered')}
                              className="mt-1 rounded-2xl"
                            >
                              ✓ Tandai Terkirim
                            </Button>
                          </div>
                        )}

                        {/* Delivered - Auto close in 3 days */}
                        {order.status === 'delivered' && (
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                              Terkirim
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Auto close dalam 3 hari
                            </span>
                          </div>
                        )}

                        {/* Completed */}
                        {order.status === 'completed' && (
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            Selesai
                          </span>
                        )}

                        {/* Cancelled/Rejected */}
                        {(order.status === 'cancelled' || order.status === 'payment_rejected') && (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                            {order.status === 'payment_rejected' ? 'Pembayaran Ditolak' : 'Dibatalkan'}
                          </span>
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

      {/* Shipping Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Input Resi Pengiriman</DialogTitle>
            <DialogDescription>
              Order: {shippingOrder?.orderCode}<br/>
              Kurir yang dipilih customer: <strong>{shippingOrder?.courier || 'Tidak ada'}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTracking} className="space-y-4">
            <div>
              <Label htmlFor="courier">Kurir</Label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <span className="font-medium">{trackingData.courier}</span>
                <p className="text-sm text-muted-foreground mt-1">
                  Kurir ini sudah dipilih oleh customer saat checkout
                </p>
              </div>
              {/* Hidden input to maintain courier value */}
              <input type="hidden" value={trackingData.courier} />
            </div>
            <div>
              <Label htmlFor="trackingNumber">Nomor Resi</Label>
              <Input
                id="trackingNumber"
                value={trackingData.trackingNumber}
                onChange={(e) => setTrackingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                placeholder="Masukkan nomor resi"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsTrackingDialogOpen(false)} className="rounded-2xl">
                Batal
              </Button>
              <Button type="submit" className="rounded-2xl">
                Kirim Barang
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
