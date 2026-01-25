'use client';

import { useSession } from 'next-auth/react';
import FloatingChat from './FloatingChat';
import EnhancedAdminChat from './EnhancedAdminChat';

export default function ChatWidget() {
  const { data: session, status } = useSession();

  // Only show admin chat if user is logged in AND is admin
  if (status === 'authenticated' && session?.user?.role === 'admin') {
    return <EnhancedAdminChat />;
  }

  // Show customer chat for everyone else (including guests)
  return <FloatingChat />;
}
