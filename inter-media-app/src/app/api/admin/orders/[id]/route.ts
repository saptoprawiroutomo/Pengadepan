import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function PUT(request: NextRequest) {
  try {
    // Extract ID from URL manually
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    console.log('PUT order request URL:', url.pathname);
    console.log('Extracted order ID:', id);
    
    if (!id || id === 'route.ts') {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    console.log('Updating order status to:', status);

    await connectDB();
    
    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }
    
    console.log('Order updated successfully:', order._id);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
