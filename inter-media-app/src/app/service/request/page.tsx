'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceRequestSchema } from '@/lib/validations';
import { z } from 'zod';
import { Wrench } from 'lucide-react';
import { toast } from 'sonner';

type ServiceRequestForm = z.infer<typeof serviceRequestSchema>;

export default function ServiceRequestPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<ServiceRequestForm>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      deviceType: '',
      complaint: '',
      address: '',
      phone: ''
    }
  });

  const onSubmit = async (data: ServiceRequestForm) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Request servis berhasil dibuat!');
        router.push('/service/my');
      } else {
        alert(result.error || 'Gagal membuat request servis');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="mb-4">Silakan login untuk request servis</p>
            <Button asChild className="rounded-2xl">
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-2xl">
          <CardHeader className="text-center">
            <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Wrench className="h-8 w-8 text-secondary" />
            </div>
            <CardTitle className="text-2xl">Request Servis</CardTitle>
            <p className="text-muted-foreground">
              Isi form di bawah untuk request servis perangkat Anda
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="deviceType">Jenis Perangkat *</Label>
                <Controller
                  name="deviceType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <SelectTrigger className="rounded-2xl">
                        <SelectValue placeholder="Pilih jenis perangkat" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="printer">Printer</SelectItem>
                        <SelectItem value="fotocopy">Fotocopy</SelectItem>
                        <SelectItem value="komputer">Komputer</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.deviceType && (
                  <p className="text-sm text-destructive mt-1">{errors.deviceType.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="complaint">Keluhan / Masalah *</Label>
                <Textarea
                  id="complaint"
                  {...register('complaint')}
                  placeholder="Jelaskan masalah yang dialami perangkat Anda secara detail..."
                  className="rounded-2xl"
                  rows={4}
                />
                {errors.complaint && (
                  <p className="text-sm text-destructive mt-1">{errors.complaint.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Alamat Lengkap *</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="Masukkan alamat lengkap untuk pickup/delivery servis"
                  className="rounded-2xl"
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Nomor Telepon *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder="08xxxxxxxxxx"
                  className="rounded-2xl"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="bg-muted/50 rounded-2xl p-4">
                <h3 className="font-medium mb-2">Informasi Layanan</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Pickup gratis untuk area dalam kota</li>
                  <li>• Estimasi waktu servis 1-3 hari kerja</li>
                  <li>• Garansi servis 30 hari</li>
                  <li>• Konsultasi gratis sebelum servis</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full rounded-2xl"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Memproses...' : 'Kirim Request Servis'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
