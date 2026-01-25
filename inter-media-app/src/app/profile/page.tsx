'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Profile Saya</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informasi Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nama Lengkap</Label>
              <Input value={session.user?.name || '-'} disabled className="rounded-2xl" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={session.user?.email || '-'} disabled className="rounded-2xl" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Role/Tipe Akun</Label>
              <Input 
                value={
                  session.user?.role === 'admin' ? 'Administrator' :
                  session.user?.role === 'kasir' ? 'Kasir' :
                  session.user?.role === 'customer' ? 'Pelanggan' :
                  session.user?.role || ''
                } 
                disabled 
                className="rounded-2xl" 
              />
            </div>
            <div>
              <Label>Status Akun</Label>
              <Input value="Aktif" disabled className="rounded-2xl" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informasi</h4>
            <p className="text-sm text-blue-800">
              Halaman profile sedang dalam pengembangan. Fitur lengkap akan segera tersedia.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
