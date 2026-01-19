import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import PaymentInfo from '@/models/PaymentInfo';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Create test payment info
    const testPaymentInfo = await PaymentInfo.create({
      type: 'bank_transfer',
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountName: 'Inter Medi-A',
      instructions: 'Transfer sesuai nominal exact, konfirmasi via WhatsApp',
      isActive: true
    });

    return NextResponse.json({ 
      message: 'Test payment info created',
      paymentInfo: testPaymentInfo
    });
  } catch (error: any) {
    console.error('Create test payment info error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
