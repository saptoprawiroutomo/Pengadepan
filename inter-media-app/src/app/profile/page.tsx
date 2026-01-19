import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function ProfilePage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto rounded-2xl">
        <CardHeader>
          <CardTitle>Profile Saya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nama</label>
            <p className="text-lg">{session.user.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-lg">{session.user.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Role</label>
            <p className="text-lg capitalize">{session.user.role}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
