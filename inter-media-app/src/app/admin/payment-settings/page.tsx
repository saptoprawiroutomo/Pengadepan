'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface PaymentInfo {
  _id: string;
  type: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  phoneNumber: string;
  instructions: string;
  isActive: boolean;
}

export default function PaymentSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentInfo | null>(null);
  const [formData, setFormData] = useState({
    type: 'bank_transfer',
    bankName: '',
    accountNumber: '',
    accountName: '',
    phoneNumber: '',
    instructions: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchPaymentMethods();
  }, [session, status, router]);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/admin/payment-info');
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPayment 
        ? `/api/admin/payment-info/${editingPayment._id}`
        : '/api/admin/payment-info';
      
      const method = editingPayment ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchPaymentMethods();
        handleDialogClose();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || 'Gagal menyimpan'}`);
      }
    } catch (error) {
      console.error('Error saving payment method:', error);
      alert('Terjadi kesalahan saat menyimpan');
    }
  };

  const handleEdit = (payment: PaymentInfo) => {
    setEditingPayment(payment);
    setFormData({
      type: payment.type,
      bankName: payment.bankName || '',
      accountNumber: payment.accountNumber || '',
      accountName: payment.accountName || '',
      phoneNumber: payment.phoneNumber || '',
      instructions: payment.instructions || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus metode pembayaran ini?')) {
      try {
        const response = await fetch(`/api/admin/payment-info/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchPaymentMethods();
        }
      } catch (error) {
        console.error('Error deleting payment method:', error);
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPayment(null);
    setFormData({
      type: 'bank_transfer',
      bankName: '',
      accountNumber: '',
      accountName: '',
      phoneNumber: '',
      instructions: ''
    });
  };

  if (status === 'loading' || isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pengaturan Pembayaran</h1>
        <p className="text-muted-foreground">Kelola informasi rekening bank untuk pembayaran</p>
      </div>

      <div className="grid gap-6">
        {/* Bank Transfer Settings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Metode Pembayaran</CardTitle>
              <p className="text-sm text-muted-foreground">Kelola rekening bank dan e-wallet untuk pembayaran</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-2xl">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Metode
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingPayment ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingPayment ? 'Ubah informasi metode pembayaran' : 'Tambahkan metode pembayaran baru'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="type">Jenis Pembayaran</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Transfer Bank</SelectItem>
                        <SelectItem value="ovo">OVO</SelectItem>
                        <SelectItem value="dana">DANA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type === 'bank_transfer' && (
                    <>
                      <div>
                        <Label htmlFor="bankName">Nama Bank</Label>
                        <Input
                          id="bankName"
                          value={formData.bankName}
                          onChange={(e) => setFormData({...formData, bankName: e.target.value})}
                          className="rounded-2xl"
                          placeholder="Contoh: Bank BCA"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Nomor Rekening</Label>
                        <Input
                          id="accountNumber"
                          value={formData.accountNumber}
                          onChange={(e) => setFormData({...formData, accountNumber: e.target.value})}
                          className="rounded-2xl"
                          placeholder="1234567890"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountName">Atas Nama</Label>
                        <Input
                          id="accountName"
                          value={formData.accountName}
                          onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                          className="rounded-2xl"
                          placeholder="Nama Pemilik Rekening"
                          required
                        />
                      </div>
                    </>
                  )}

                  {(formData.type === 'ovo' || formData.type === 'dana') && (
                    <div>
                      <Label htmlFor="phoneNumber">Nomor HP {formData.type.toUpperCase()}</Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className="rounded-2xl"
                        placeholder="081234567890"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="instructions">Instruksi Pembayaran</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                      className="rounded-2xl"
                      placeholder="Instruksi untuk customer"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="rounded-2xl">
                      {editingPayment ? 'Update' : 'Simpan'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleDialogClose} className="rounded-2xl">
                      Batal
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Info</TableHead>
                  <TableHead>Atas Nama / No HP</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-medium">
                      {payment.type === 'bank_transfer' ? 'Bank Transfer' : 
                       payment.type === 'ovo' ? 'OVO' : 
                       payment.type === 'dana' ? 'DANA' : payment.type}
                    </TableCell>
                    <TableCell className="font-mono">
                      {payment.type === 'bank_transfer' ? 
                        `${payment.bankName} - ${payment.accountNumber}` :
                        payment.phoneNumber
                      }
                    </TableCell>
                    <TableCell>
                      {payment.type === 'bank_transfer' ? payment.accountName : payment.phoneNumber}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        payment.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(payment)}
                          className="rounded-2xl"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(payment._id)}
                          className="rounded-2xl"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* COD Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan COD (Cash on Delivery)</CardTitle>
            <p className="text-sm text-muted-foreground">Pengaturan untuk pembayaran di tempat</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informasi COD</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• COD hanya tersedia untuk pengiriman dengan Kurir Toko</li>
                <li>• Area COD: Jakarta (Same Day) dan Jabodetabek (1 hari)</li>
                <li>• Customer bayar langsung ke kurir saat barang sampai</li>
                <li>• Tidak perlu upload bukti pembayaran</li>
              </ul>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">✅ Zona COD Tersedia</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Jakarta Pusat, Utara, Selatan, Barat, Timur</li>
                  <li>• Bogor, Depok, Tangerang, Bekasi</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2">⚠️ Zona COD Tidak Tersedia</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Bandung, Cirebon, Sukabumi</li>
                  <li>• Surabaya, Yogyakarta, Semarang</li>
                  <li>• Medan, Palembang, Makassar</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Pengaturan Ekspedisi</CardTitle>
            <p className="text-sm text-muted-foreground">Informasi tarif dan zona pengiriman</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">🚚 Ekspedisi Tersedia</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>JNE REG</span>
                    <span className="text-muted-foreground">Zona 1-5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TIKI REG</span>
                    <span className="text-muted-foreground">Zona 1-5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>POS REG</span>
                    <span className="text-muted-foreground">Zona 1-5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>J&T REG</span>
                    <span className="text-muted-foreground">Zona 1-5</span>
                  </div>
                  <div className="flex justify-between">
                    <span>SiCepat REG</span>
                    <span className="text-muted-foreground">Zona 1-5</span>
                  </div>
                  <div className="flex justify-between font-medium text-green-700">
                    <span>KURIR TOKO</span>
                    <span>Zona 1-2</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">📍 Zona Pengiriman</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Zona 1:</strong> Jakarta (1 hari)</div>
                  <div><strong>Zona 2:</strong> Jabodetabek (1-2 hari)</div>
                  <div><strong>Zona 3:</strong> Jawa Barat (2-3 hari)</div>
                  <div><strong>Zona 4:</strong> Pulau Jawa (3-4 hari)</div>
                  <div><strong>Zona 5:</strong> Luar Jawa (4-6 hari)</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
