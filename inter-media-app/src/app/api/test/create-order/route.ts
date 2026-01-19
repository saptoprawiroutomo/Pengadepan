import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    console.log('Creating test order for user:', session.user.id);

    // Create test order with proper ObjectId
    const testOrder = await Order.create({
      orderCode: 'TEST-' + Date.now(),
      userId: session.user.id, // This should already be ObjectId from session
      items: [{
        productId: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
        nameSnapshot: 'Test Product - Printer Canon',
        priceSnapshot: 100000,
        weightSnapshot: 500,
        qty: 1,
        subtotal: 100000
      }],
      subtotal: 100000,
      shippingCost: 15000,
      total: 115000,
      status: 'pending',
      shippingAddress: 'Jl. Test No. 123, Jakarta Pusat, DKI Jakarta',
      paymentMethod: 'transfer'
    });

    console.log('Test order created:', testOrder._id);

    return NextResponse.json({ 
      message: 'Test order created',
      orderId: testOrder._id,
      orderCode: testOrder.orderCode
    });
  } catch (error: any) {
    console.error('Create test order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
