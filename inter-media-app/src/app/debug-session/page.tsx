'use client';

import { useSession } from 'next-auth/react';

export default function DebugSession() {
  const { data: session, status } = useSession();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Session</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Session:</strong></p>
        <pre className="mt-2 text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
