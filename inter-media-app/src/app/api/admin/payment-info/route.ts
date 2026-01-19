import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import PaymentInfo from '@/models/PaymentInfo';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const paymentMethods = await PaymentInfo.find().sort({ createdAt: -1 });
    
    return NextResponse.json(paymentMethods);
  } catch (error: any) {
    console.error('Admin payment info API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, bankName, accountNumber, accountName, instructions } = body;

    await connectDB();

    const paymentInfo = await PaymentInfo.create({
      type,
      bankName,
      accountNumber,
      accountName,
      instructions,
      isActive: true
    });

    return NextResponse.json(paymentInfo);
  } catch (error: any) {
    console.error('Create payment info error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
