'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  userId: { name: string; email: string };
  items: Array<{
    productId: { name: string };
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
  shippingAddress: string;
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingData, setTrackingData] = useState({
    trackingNumber: '',
    courier: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchOrders();
  }, [session, status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        console.error('Failed to fetch orders:', response.status);
        return;
      }
      const data = await response.json();
      console.log('Orders data:', data);
      console.log('Orders with payment proof:', data.filter((o: Order) => o.paymentProof));
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
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
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const handleAddTracking = (order: Order) => {
    setSelectedOrder(order);
    setIsTrackingDialogOpen(true);
  };

  const handleSubmitTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder) return;

    try {
      const response = await fetch(`/api/admin/orders/${selectedOrder._id}/tracking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackingData),
      });

      if (response.ok) {
        fetchOrders();
        setIsTrackingDialogOpen(false);
        setTrackingData({ trackingNumber: '', courier: '' });
        setSelectedOrder(null);
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error adding tracking:', error);
      alert('Terjadi kesalahan');
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
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
                        <div className="font-medium">{order.userId?.name}</div>
                        <div className="text-sm text-muted-foreground">{order.userId?.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.items?.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.nameSnapshot} x{item.qty}
                          {item.weightSnapshot && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({item.weightSnapshot}g)
                            </span>
                          )}
                        </div>
                      ))}
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
                                <img 
                                  src={order.paymentProof} 
                                  alt="Bukti Transfer" 
                                  className="w-full max-h-96 object-contain rounded-lg border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling!.style.display = 'block';
                                  }}
                                />
                                <div style={{display: 'none'}} className="text-center p-8 text-muted-foreground">
                                  Gagal memuat gambar bukti transfer
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {order.paymentProofUploadedAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(order.paymentProofUploadedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Belum upload</span>
                      )}
                    </TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* View Payment Proof for Transfer */}
                        {order.paymentMethod === 'transfer' && order.paymentProof && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(order.paymentProof, '_blank')}
                          >
                            Bukti Bayar
                          </Button>
                        )}
                        
                        {/* Status Actions */}
                        {order.status === 'pending' && order.paymentMethod === 'transfer' && !order.paymentProof && (
                          <span className="text-xs text-muted-foreground">Menunggu bukti bayar</span>
                        )}
                        
                        {order.status === 'pending' && (order.paymentMethod === 'cod' || order.paymentProof) && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order._id, 'processed')}
                          >
                            Proses
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
