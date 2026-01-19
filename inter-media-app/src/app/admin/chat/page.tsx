'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

export default function AdminChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user?.role !== 'admin') {
    router.push('/login');
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Chat Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Fitur Chat Sedang Dikembangkan</h3>
            <p className="text-muted-foreground">
              Sistem chat real-time akan segera tersedia untuk berkomunikasi dengan pelanggan.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
