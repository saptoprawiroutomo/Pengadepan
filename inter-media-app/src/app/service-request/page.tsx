'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Wrench, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';

export default function ServiceRequestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    deviceType: '',
    complaint: '',
    customerName: '',
    phone: '',
    address: '',
    preferredTime: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowSuccessModal(true);
        setFormData({
          deviceType: '',
          complaint: '',
          customerName: '',
          phone: '',
          address: '',
          preferredTime: ''
        });
      } else {
        setErrorMessage('Gagal mengirim request. Silakan coba lagi.');
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Request Service</h1>
        <p className="text-muted-foreground">
          Butuh bantuan perbaikan printer, fotocopy, atau komputer? Isi form di bawah ini dan tim teknisi kami akan menghubungi Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Form Request Service
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="deviceType">Jenis Perangkat</Label>
              <Select value={formData.deviceType} onValueChange={(value) => 
                setFormData({...formData, deviceType: value})
              }>
                <SelectTrigger className="rounded-2xl">
                  <SelectValue placeholder="Pilih jenis perangkat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="printer">Printer</SelectItem>
                  <SelectItem value="fotocopy">Mesin Fotocopy</SelectItem>
                  <SelectItem value="komputer">Komputer/Laptop</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="complaint">Keluhan/Masalah</Label>
              <Textarea
                id="complaint"
                value={formData.complaint}
                onChange={(e) => setFormData({...formData, complaint: e.target.value})}
                placeholder="Jelaskan masalah yang dialami..."
                required
                className="rounded-2xl"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Nama Lengkap</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                  required
                  className="rounded-2xl"
                  placeholder="Nama lengkap Anda"
                />
              </div>
              <div>
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  className="rounded-2xl"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                required
                className="rounded-2xl"
                placeholder="Alamat lengkap untuk kunjungan teknisi"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="preferredTime">Waktu Kunjungan yang Diinginkan</Label>
              <Input
                id="preferredTime"
                value={formData.preferredTime}
                onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                className="rounded-2xl"
                placeholder="Contoh: Senin-Jumat 09:00-17:00"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informasi Service</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Teknisi akan menghubungi Anda dalam 1x24 jam</li>
                <li>• Biaya konsultasi dan diagnosa gratis</li>
                <li>• Pembayaran setelah perbaikan selesai</li>
                <li>• Garansi service 30 hari</li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full rounded-2xl" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Request Service'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Phone className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Hubungi Langsung</h3>
            <p className="text-sm text-muted-foreground mb-2">Untuk service urgent</p>
            <Button variant="outline" size="sm" className="rounded-2xl" asChild>
              <a href="https://wa.me/6289533396142" target="_blank" rel="noopener noreferrer">
                📱 WhatsApp
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3 className="font-medium mb-1">Kunjungi Toko</h3>
            <p className="text-sm text-muted-foreground mb-2">Bawa perangkat langsung</p>
            <p className="text-xs text-muted-foreground mb-3">
              Jln Klingkit Dalam Blok C No 22<br/>
              RT 010/011, Rawa Buaya<br/>
              Cengkareng, Jakarta Barat 11470
            </p>
            <Button variant="outline" size="sm" className="rounded-2xl" asChild>
              <a href="https://maps.google.com/?q=Jln+Klingkit+Dalam+Blok+C+No+22+RT+010+011+Rawa+Buaya+Cengkareng+Jakarta+Barat+11470" target="_blank" rel="noopener noreferrer">
                📍 Lihat Lokasi
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <DialogTitle className="text-green-700">Request Berhasil Dikirim!</DialogTitle>
            </div>
            <DialogDescription className="text-center py-4">
              <div className="space-y-3">
                <p className="text-base">
                  Tim kami akan menghubungi Anda segera untuk mengatur jadwal service.
                </p>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-700">
                    📞 Kami akan menghubungi dalam 1-2 jam kerja<br/>
                    🔧 Tim teknisi siap membantu<br/>
                    📍 Service bisa di tempat atau di toko
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setShowSuccessModal(false)} className="w-full">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <DialogTitle className="text-red-700">Gagal Mengirim Request</DialogTitle>
            </div>
            <DialogDescription className="text-center py-4">
              <div className="space-y-3">
                <p className="text-base">{errorMessage}</p>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-700">
                    Silakan coba lagi atau hubungi kami langsung:<br/>
                    📞 (021) 1234-5678<br/>
                    📱 WhatsApp: 0812-3456-7890
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setShowErrorModal(false)} variant="outline" className="w-full">
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
