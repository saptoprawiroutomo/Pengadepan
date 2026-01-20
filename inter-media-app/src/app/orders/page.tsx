'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Printer } from 'lucide-react';

interface OrderItem {
  productId: {
    _id: string;
    name: string;
    slug: string;
  };
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderCode: string;
  items: OrderItem[];
  total: number;
  status: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentProof?: string;
  paymentProofUploadedAt?: string;
  trackingNumber?: string;
  courier?: string;
  shippedAt?: string;
  createdAt: string;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processed: 'bg-purple-100 text-purple-800',
  shipped: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  pending: 'Menunggu Pembayaran',
  paid: 'Sudah Dibayar',
  processed: 'Diproses',
  shipped: 'Dikirim',
  done: 'Selesai',
  cancelled: 'Dibatalkan',
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingProof, setUploadingProof] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState<'success' | 'error'>('success');

  const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders/my');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadPaymentProof = async (orderId: string, file: File) => {
    setUploadingProof(orderId);
    
    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const response = await fetch('/api/upload-payment-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentProof: base64 }),
      });

      if (response.ok) {
        showMessage('Bukti pembayaran berhasil diupload!', 'success');
        fetchOrders(); // Refresh orders
      } else {
        const errorData = await response.json();
        showMessage(`Error: ${errorData.error}`, 'error');
      }
    } catch (error) {
      showMessage('Terjadi kesalahan saat upload', 'error');
    } finally {
      setUploadingProof(null);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders/my');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPaymentInfo = async () => {
      try {
        console.log('Fetching payment info...');
        const response = await fetch('/api/payment-info');
        console.log('Payment info response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Payment info data:', data);
          setPaymentInfo(data || []);
        }
      } catch (error) {
        console.error('Error fetching payment info:', error);
      }
    };

    if (session) {
      fetchOrders();
      fetchPaymentInfo();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="mb-4">Silakan login untuk melihat pesanan</p>
            <Button asChild className="rounded-2xl">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardContent className="p-6 text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Belum Ada Pesanan</h2>
            <p className="text-muted-foreground mb-4">Anda belum memiliki pesanan apapun</p>
            <div className="space-y-2">
              <Button asChild className="rounded-2xl w-full">
                <Link href="/products">Mulai Belanja</Link>
              </Button>
              <Button 
                variant="outline" 
                className="rounded-2xl w-full"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/test/create-order', { method: 'POST' });
                    if (response.ok) {
                      const data = await response.json();
                      // Redirect to the new order detail page
                      window.location.href = `/orders/${data.orderId}`;
                    } else {
                      showMessage('Error creating test order', 'error');
                    }
                  } catch (error) {
                    console.error('Error creating test order:', error);
                    showMessage('Error creating test order', 'error');
                  }
                }}
              >
                Buat Test Order & Lihat Detail
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pesanan Saya</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id} className="rounded-2xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{order.orderCode}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.nameSnapshot}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.qty} x Rp {item.priceSnapshot.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="font-medium">
                      Rp {item.subtotal.toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span className="text-primary">
                      Rp {order.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Upload Payment Proof - Only for Transfer */}
                {order.status === 'pending' && order.paymentMethod === 'transfer' && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload bukti transfer untuk konfirmasi pembayaran
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadPaymentProof(order._id, file);
                        }
                      }}
                      disabled={uploadingProof === order._id}
                      className="w-full text-sm"
                    />
                    {uploadingProof === order._id && (
                      <p className="text-sm text-blue-600 mt-1">Mengupload...</p>
                    )}
                  </div>
                )}

                {/* COD Information */}
                {order.paymentMethod === 'cod' && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-3">
                    <p className="text-sm text-green-800 font-medium mb-1">
                      💰 Bayar di Tempat (COD)
                    </p>
                    <p className="text-sm text-green-700">
                      Siapkan uang pas sebesar <strong>Rp {order.total.toLocaleString('id-ID')}</strong> untuk dibayarkan kepada kurir saat barang sampai.
                    </p>
                    <p className="text-xs text-green-600 mt-2">
                      Pesanan akan diproses dan dikirim dengan kurir toko kami.
                    </p>
                  </div>
                )}

                {/* Transfer Info for All Transfer Orders */}
                {order.paymentMethod === 'transfer' && order.status !== 'pending' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                      ✅ Pembayaran Transfer Bank
                    </p>
                    <p className="text-sm text-blue-700">
                      Total: <strong>Rp {order.total.toLocaleString('id-ID')}</strong>
                    </p>
                    {order.paymentProof && (
                      <p className="text-xs text-blue-600 mt-1">
                        Bukti transfer sudah diverifikasi
                      </p>
                    )}
                  </div>
                )}

                {/* Payment Proof Status - Only for Transfer */}
                {order.paymentMethod === 'transfer' && order.paymentProof && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-green-600">
                      ✓ Bukti pembayaran sudah diupload
                    </p>
                    {order.paymentProofUploadedAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.paymentProofUploadedAt).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <p><strong>Alamat:</strong> {order.shippingAddress}</p>
                  <p><strong>Pembayaran:</strong> {
                    order.paymentMethod === 'transfer' ? 'Transfer Bank' : 
                    order.paymentMethod === 'cod' ? 'Bayar di Tempat (COD)' : 
                    'Bayar di Tempat'
                  }</p>
                </div>

                {order.status === 'pending' && order.paymentMethod === 'transfer' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      💳 Transfer ke Rekening Toko:
                    </p>
                    
                    {paymentInfo.length > 0 ? (
                      <div className="bg-white rounded-lg p-3 mt-2">
                        {paymentInfo.map((info, index) => (
                          <div key={index} className="mb-2 last:mb-0">
                            <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg">
                              <div>
                                <p className="font-bold text-lg text-blue-900">{info.bankName}</p>
                                <p className="text-sm text-blue-700">A.n: {info.accountName}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-bold text-xl text-blue-900">{info.accountNumber}</p>
                                <p className="text-xs text-blue-600">Salin Nomor Rekening</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-bold text-green-800">
                            💰 Total Transfer: Rp {order.total.toLocaleString('id-ID')}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            Transfer sesuai nominal exact, lalu upload bukti transfer.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <p className="text-sm text-red-800 mb-2">
                          ⚠️ Rekening toko belum diatur oleh admin
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/test/create-payment-info', { method: 'POST' });
                              if (response.ok) {
                                window.location.reload();
                              }
                            } catch (error) {
                              console.error('Error creating payment info:', error);
                            }
                          }}
                        >
                          Buat Rekening Test (Admin)
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Tracking Information */}
                {order.trackingNumber && (
                  <div className="border-t pt-3">
                    <h4 className="font-medium mb-2">Informasi Pengiriman</h4>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm"><strong>Kurir:</strong> {order.courier}</p>
                      <p className="text-sm"><strong>No. Resi:</strong> 
                        <span className="font-mono font-bold ml-1">{order.trackingNumber}</span>
                      </p>
                      {order.shippedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Dikirim: {new Date(order.shippedAt).toLocaleString('id-ID')}
                        </p>
                      )}
                      <p className="text-xs text-blue-600 mt-2">
                        Lacak paket Anda di website resmi {order.courier}
                      </p>
                    </div>
                  </div>
                )}

                {/* Print Receipt & Upload */}
                <div className="border-t pt-3 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`/api/orders/${order._id}/receipt`, '_blank')}
                  >
                    <Printer className="mr-1 h-4 w-4" />
                    Print Resi
                  </Button>
                </div>

                {/* Upload Payment Proof - Only for Transfer */}
                {order.status === 'pending' && order.paymentMethod === 'transfer' && !order.paymentProof && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload bukti transfer untuk konfirmasi pembayaran
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleUploadPaymentProof(order._id, file);
                        }
                      }}
                      disabled={uploadingProof === order._id}
                      className="w-full text-sm"
                    />
                    {uploadingProof === order._id && (
                      <p className="text-sm text-blue-600 mt-1">Mengupload...</p>
                    )}
                  </div>
                )}

                {/* Payment Proof Status */}
                {order.paymentMethod === 'transfer' && order.paymentProof && (
                  <div className="border-t pt-3">
                    <p className="text-sm text-green-600">
                      ✓ Bukti pembayaran sudah diupload
                    </p>
                    {order.paymentProofUploadedAt && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.paymentProofUploadedAt).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-xl">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                popupType === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {popupType === 'success' ? (
                  <span className="text-2xl">✅</span>
                ) : (
                  <span className="text-2xl">❌</span>
                )}
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${
                popupType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {popupType === 'success' ? 'Berhasil!' : 'Error!'}
              </h3>
              <p className="text-gray-600 mb-4">{popupMessage}</p>
              <Button 
                onClick={() => setShowPopup(false)}
                className={`w-full rounded-2xl ${
                  popupType === 'success' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                OK
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
