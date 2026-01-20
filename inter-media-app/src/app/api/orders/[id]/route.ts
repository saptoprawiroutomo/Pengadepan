import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Order ID received:', id);
    console.log('User ID:', session.user.id);

    // Validate ObjectId format (24 hex characters)
    if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
      console.log('Invalid ObjectId format');
      return NextResponse.json({ error: 'Invalid order ID format' }, { status: 400 });
    }

    await connectDB();

    const order = await Order.findOne({ 
      _id: id, 
      userId: session.user.id 
    }).populate('items.productId', 'name slug');

    console.log('Order found:', !!order);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error('Get order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
