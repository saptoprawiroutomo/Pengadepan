'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ServiceRequest {
  _id: string;
  serviceCode: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
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

export default function AdminServicesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceRequest | null>(null);
  const [formData, setFormData] = useState({
    status: '',
    laborCost: 0,
    partsCost: 0,
  });

  useEffect(() => {
    if (!session) return;
    
    if (!['admin', 'kasir'].includes(session.user.role)) {
      router.push('/');
      return;
    }

    fetchServices();
  }, [session, router]);

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

  const handleEdit = (service: ServiceRequest) => {
    setEditingService(service);
    setFormData({
      status: service.status,
      laborCost: service.laborCost,
      partsCost: service.partsCost,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingService) return;

    try {
      const response = await fetch(`/api/services/${editingService._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchServices();
        setIsDialogOpen(false);
        setEditingService(null);
      } else {
        toast.error('Gagal mengupdate servis');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingService(null);
  };

  if (!session || !['admin', 'kasir'].includes(session.user.role)) {
    return <div className="container mx-auto px-4 py-8">Unauthorized</div>;
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Kelola Servis</h1>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Daftar Request Servis</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Perangkat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Biaya</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service._id}>
                  <TableCell className="font-medium">{service.serviceCode}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{service.userId.name}</p>
                      <p className="text-sm text-muted-foreground">{service.userId.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {deviceTypeLabels[service.deviceType as keyof typeof deviceTypeLabels]}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[service.status as keyof typeof statusColors]}>
                      {statusLabels[service.status as keyof typeof statusLabels]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {service.totalCost > 0 ? (
                      <span className="font-medium">Rp {service.totalCost.toLocaleString('id-ID')}</span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(service.createdAt).toLocaleDateString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(service)}
                        className="rounded-2xl"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {service.totalCost > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/api/services/invoice/${service._id}`, '_blank')}
                          className="rounded-2xl"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Servis - {editingService?.serviceCode}</DialogTitle>
          </DialogHeader>
          
          {editingService && (
            <div className="space-y-4">
              {/* Service Details */}
              <div className="bg-muted/50 rounded-2xl p-4">
                <h3 className="font-medium mb-2">Detail Servis</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Customer:</strong> {editingService.userId.name}</p>
                    <p><strong>Perangkat:</strong> {deviceTypeLabels[editingService.deviceType as keyof typeof deviceTypeLabels]}</p>
                  </div>
                  <div>
                    <p><strong>Telepon:</strong> {editingService.phone}</p>
                    <p><strong>Alamat:</strong> {editingService.address}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p><strong>Keluhan:</strong></p>
                  <p className="text-muted-foreground">{editingService.complaint}</p>
                </div>
              </div>

              {/* Update Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="received">Diterima</SelectItem>
                      <SelectItem value="checking">Pengecekan</SelectItem>
                      <SelectItem value="repairing">Perbaikan</SelectItem>
                      <SelectItem value="done">Selesai</SelectItem>
                      <SelectItem value="delivered">Terkirim</SelectItem>
                      <SelectItem value="cancelled">Dibatalkan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="laborCost">Biaya Jasa</Label>
                    <Input
                      id="laborCost"
                      type="number"
                      value={formData.laborCost}
                      onChange={(e) => setFormData({...formData, laborCost: parseInt(e.target.value) || 0})}
                      className="rounded-2xl"
                      min="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="partsCost">Biaya Sparepart</Label>
                    <Input
                      id="partsCost"
                      type="number"
                      value={formData.partsCost}
                      onChange={(e) => setFormData({...formData, partsCost: parseInt(e.target.value) || 0})}
                      className="rounded-2xl"
                      min="0"
                    />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-2xl p-3">
                  <div className="flex justify-between font-medium">
                    <span>Total Biaya:</span>
                    <span className="text-primary">
                      Rp {(formData.laborCost + formData.partsCost).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="rounded-2xl">
                    Update Servis
                  </Button>
                  <Button type="button" variant="outline" onClick={handleDialogClose} className="rounded-2xl">
                    Batal
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
