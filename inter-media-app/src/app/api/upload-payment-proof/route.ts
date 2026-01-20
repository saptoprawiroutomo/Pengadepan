import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, paymentProof } = await request.json();
    
    if (!orderId || !paymentProof) {
      return NextResponse.json({ error: 'Order ID and payment proof required' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOneAndUpdate(
      { 
        _id: orderId, 
        userId: session.user.id,
        status: 'pending',
        paymentMethod: 'transfer'
      },
      { 
        paymentProof,
        paymentProofUploadedAt: new Date(),
        // Status tetap 'pending' - menunggu verifikasi admin
        adminNotes: 'Bukti pembayaran telah diupload, menunggu verifikasi admin'
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
