import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import UsersClient from './UsersClient';

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return <UsersClient />;
}
