import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PaymentInfo from '@/models/PaymentInfo';

export async function GET() {
  try {
    await connectDB();
    
    const paymentMethods = await PaymentInfo.find({ isActive: true });
    
    return NextResponse.json(paymentMethods);
  } catch (error: any) {
    console.error('Payment info API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
