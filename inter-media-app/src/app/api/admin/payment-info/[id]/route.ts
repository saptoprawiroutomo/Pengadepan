import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import PaymentInfo from '@/models/PaymentInfo';

export async function PUT(request: NextRequest) {
  try {
    // Extract ID from URL manually
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    if (!id || id === 'route.ts') {
      return NextResponse.json({ error: 'Payment info ID is required' }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bankName, accountNumber, accountName, instructions } = body;

    await connectDB();

    const paymentInfo = await PaymentInfo.findByIdAndUpdate(
      id,
      { bankName, accountNumber, accountName, instructions },
      { new: true }
    );

    if (!paymentInfo) {
      return NextResponse.json({ error: 'Payment info tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(paymentInfo);
  } catch (error: any) {
    console.error('Update payment info error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Extract ID from URL manually
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    if (!id || id === 'route.ts') {
      return NextResponse.json({ error: 'Payment info ID is required' }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const paymentInfo = await PaymentInfo.findByIdAndDelete(id);

    if (!paymentInfo) {
      return NextResponse.json({ error: 'Payment info tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Payment info berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete payment info error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
