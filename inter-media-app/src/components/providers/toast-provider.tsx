'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors
      closeButton
      toastOptions={{
        style: {
          borderRadius: '12px',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        },
        className: 'rounded-xl backdrop-blur-sm',
        duration: 4000,
      }}
      theme="light"
      visibleToasts={5}
    />
  );
}
