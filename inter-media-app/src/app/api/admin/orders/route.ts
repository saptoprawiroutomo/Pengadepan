import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const orders = await Order.find()
      .populate('userId', 'name email')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(orders);
  } catch (error: any) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
