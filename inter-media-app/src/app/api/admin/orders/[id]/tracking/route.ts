import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function POST(request: NextRequest) {
  try {
    // Extract ID from URL manually
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const orderId = pathSegments[pathSegments.indexOf('orders') + 1];
    
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trackingNumber, courier } = await request.json();

    if (!trackingNumber || !courier) {
      return NextResponse.json({ error: 'Nomor resi dan kurir wajib diisi' }, { status: 400 });
    }

    await connectDB();

    // Validate ObjectId
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    if (order.status !== 'processed') {
      return NextResponse.json({ error: 'Order belum diproses' }, { status: 400 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        trackingNumber,
        courier,
        shippedAt: new Date(),
        status: 'shipped'
      },
      { new: true }
    );

    return NextResponse.json({ 
      message: 'Resi berhasil ditambahkan',
      order: updatedOrder 
    });
  } catch (error: any) {
    console.error('Add tracking number error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
