import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentProof } = await request.json();
    
    if (!paymentProof) {
      return NextResponse.json({ error: 'Payment proof is required' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOneAndUpdate(
      { 
        _id: id, 
        userId: session.user.id,
        status: 'pending'
      },
      { 
        paymentProof,
        paymentProofUploadedAt: new Date(),
        status: 'paid'
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Order not found or cannot be updated' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Payment proof uploaded successfully',
      order 
    });
  } catch (error: any) {
    console.error('Upload payment proof error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
