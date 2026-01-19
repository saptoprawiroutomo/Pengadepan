'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';

interface ServiceRequest {
  _id: string;
  serviceCode: string;
  deviceType: string;
  complaint: string;
  address: string;
  phone: string;
  status: string;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  createdAt: string;
}

const statusColors = {
  received: 'bg-blue-100 text-blue-800',
  checking: 'bg-yellow-100 text-yellow-800',
  repairing: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800',
  delivered: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusLabels = {
  received: 'Diterima',
  checking: 'Pengecekan',
  repairing: 'Perbaikan',
  done: 'Selesai',
  delivered: 'Terkirim',
  cancelled: 'Dibatalkan',
};

const deviceTypeLabels = {
  printer: 'Printer',
  fotocopy: 'Fotocopy',
  komputer: 'Komputer',
  lainnya: 'Lainnya',
};

export default function MyServicesPage() {
  const { data: session } = useSession();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchServices();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="mb-4">Silakan login untuk melihat servis</p>
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

  if (services.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto rounded-2xl">
          <CardContent className="p-6 text-center">
            <Wrench className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Belum Ada Request Servis</h2>
            <p className="text-muted-foreground mb-4">Anda belum memiliki request servis apapun</p>
            <Button asChild className="rounded-2xl">
              <Link href="/service/request">Request Servis</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Servis Saya</h1>
        <Button asChild className="rounded-2xl">
          <Link href="/service/request">Request Servis Baru</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <Card key={service._id} className="rounded-2xl">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.serviceCode}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Date(service.createdAt).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Badge className={statusColors[service.status as keyof typeof statusColors]}>
                  {statusLabels[service.status as keyof typeof statusLabels]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">
                    {deviceTypeLabels[service.deviceType as keyof typeof deviceTypeLabels]}
                  </p>
                  <p className="text-sm text-muted-foreground">{service.complaint}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Alamat:</p>
                    <p className="text-muted-foreground">{service.address}</p>
                  </div>
                  <div>
                    <p className="font-medium">Telepon:</p>
                    <p className="text-muted-foreground">{service.phone}</p>
                  </div>
                </div>

                {service.totalCost > 0 && (
                  <div className="bg-muted/50 rounded-2xl p-3">
                    <h4 className="font-medium mb-2">Biaya Servis</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Biaya Jasa:</span>
                        <span>Rp {service.laborCost.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Biaya Sparepart:</span>
                        <span>Rp {service.partsCost.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-1">
                        <span>Total:</span>
                        <span className="text-primary">Rp {service.totalCost.toLocaleString('id-ID')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {service.status === 'received' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3">
                    <p className="text-sm text-blue-800">
                      Request servis Anda telah diterima. Tim kami akan segera menghubungi Anda.
                    </p>
                  </div>
                )}

                {service.status === 'done' && service.totalCost > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-3">
                    <p className="text-sm text-green-800">
                      Servis telah selesai. Silakan lakukan pembayaran untuk pengambilan perangkat.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
