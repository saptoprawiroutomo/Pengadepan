'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wrench, Clock, AlertTriangle } from 'lucide-react';
import { formatSLATime, getSLAStatus } from '@/lib/sla-utils';

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
  priority?: string;
  slaTarget?: string;
  slaStatus?: string;
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

const slaColors = {
  'on-time': 'bg-green-100 text-green-800',
  'at-risk': 'bg-yellow-100 text-yellow-800',
  'overdue': 'bg-red-100 text-red-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
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
        console.log('Fetching services for user:', session?.user?.id);
        const response = await fetch('/api/service-requests');
        console.log('Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('API Response:', data);
          // API mengembalikan { requests: [...] }
          const serviceList = data.requests || data || [];
          console.log('Service list:', serviceList);
          setServices(Array.isArray(serviceList) ? serviceList : []);
        } else {
          console.log('Response not ok:', response.statusText);
          setServices([]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setServices([]);
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
        {Array.isArray(services) && services.length > 0 ? (
          services.map((service) => (
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
                <div className="flex flex-col gap-2 items-end">
                  <Badge className={statusColors[service.status as keyof typeof statusColors]}>
                    {statusLabels[service.status as keyof typeof statusLabels]}
                  </Badge>
                  {service.priority && (
                    <Badge variant="outline" className={priorityColors[service.priority as keyof typeof priorityColors]}>
                      {service.priority.toUpperCase()}
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* SLA Information */}
              {service.slaTarget && service.status !== 'delivered' && service.status !== 'cancelled' && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Target SLA:</span>
                    </div>
                    <Badge className={slaColors[service.slaStatus as keyof typeof slaColors] || 'bg-gray-100 text-gray-800'}>
                      {service.slaTarget ? formatSLATime(new Date(service.slaTarget)) : 'Tidak ada target'}
                    </Badge>
                  </div>
                  {service.slaStatus === 'overdue' && (
                    <div className="flex items-center gap-1 mt-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-xs">Melebihi target waktu servis</span>
                    </div>
                  )}
                </div>
              )}
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
        ))
        ) : (
          <Card className="rounded-2xl">
            <CardContent className="p-6 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Belum Ada Request Servis</h3>
              <p className="text-muted-foreground mb-4">
                Anda belum pernah mengajukan request servis. Mulai request servis untuk perangkat printer, fotocopy, atau komputer Anda.
              </p>
              <Button asChild className="rounded-2xl">
                <Link href="/service/request">Request Servis Sekarang</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
