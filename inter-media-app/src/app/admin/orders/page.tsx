import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import OrdersClient from './OrdersClient';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'admin') {
    redirect('/');
  }

  return <OrdersClient />;
}
