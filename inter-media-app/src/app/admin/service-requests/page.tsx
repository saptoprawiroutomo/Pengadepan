'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wrench } from 'lucide-react';

interface ServiceRequest {
  _id: string;
  serviceCode: string;
  deviceType: string;
  complaint: string;
  address: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function AdminServiceRequestsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchRequests();
    }
  }, [session]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/service-requests');
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const response = await fetch(`/api/service-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchRequests();
      } else {
        const errorData = await response.text();
        alert(`Gagal update status: ${response.status} - ${errorData}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Terjadi kesalahan saat update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!session || session.user?.role !== 'admin') return null;

  const getStatusBadge = (status: string) => {
    const colors = {
      received: 'bg-blue-100 text-blue-800',
      checking: 'bg-yellow-100 text-yellow-800',
      repairing: 'bg-orange-100 text-orange-800',
      done: 'bg-green-100 text-green-800',
      delivered: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      received: 'Diterima',
      checking: 'Pengecekan',
      repairing: 'Perbaikan',
      done: 'Selesai',
      delivered: 'Diantar',
      cancelled: 'Dibatalkan'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Service Requests</h1>
        <p className="text-muted-foreground">Kelola permintaan service dari pelanggan</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Daftar Service Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Belum ada service request</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Code</TableHead>
                  <TableHead>Perangkat</TableHead>
                  <TableHead>Keluhan</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req._id}>
                    <TableCell className="font-medium">{req.serviceCode}</TableCell>
                    <TableCell className="capitalize">{req.deviceType}</TableCell>
                    <TableCell className="max-w-xs truncate">{req.complaint}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{req.phone}</div>
                        <div className="text-muted-foreground truncate max-w-xs">{req.address}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(req.status)}</TableCell>
                    <TableCell>{new Date(req.createdAt).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {req.status === 'received' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(req._id, 'checking')}
                            disabled={updatingId === req._id}
                          >
                            {updatingId === req._id ? 'Loading...' : 'Cek'}
                          </Button>
                        )}
                        {req.status === 'checking' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(req._id, 'repairing')}
                            disabled={updatingId === req._id}
                          >
                            {updatingId === req._id ? 'Loading...' : 'Perbaiki'}
                          </Button>
                        )}
                        {req.status === 'repairing' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(req._id, 'done')}
                            disabled={updatingId === req._id}
                          >
                            {updatingId === req._id ? 'Loading...' : 'Selesai'}
                          </Button>
                        )}
                        {req.status === 'done' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(req._id, 'delivered')}
                            disabled={updatingId === req._id}
                            variant="outline"
                          >
                            {updatingId === req._id ? 'Loading...' : 'Tutup Tiket'}
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
    </div>
  );
}
