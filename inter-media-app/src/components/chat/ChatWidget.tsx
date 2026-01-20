'use client';

import { useSession } from 'next-auth/react';
import FloatingChat from './FloatingChat';
import AdminFloatingChat from './AdminFloatingChat';

export default function ChatWidget() {
  const { data: session } = useSession();

  if (session?.user?.role === 'admin') {
    return <AdminFloatingChat />;
  }

  return <FloatingChat />;
}
