import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Inter Media App is running!',
    status: 'OK',
    timestamp: new Date().toISOString(),
    features: [
      'E-commerce Platform',
      'Product Catalog',
      'Shopping Cart',
      'Admin Panel',
      'Chat Support',
      'POS System'
    ]
  });
}
