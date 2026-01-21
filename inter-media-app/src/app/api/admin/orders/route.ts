import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Get orders directly from database without populate to avoid errors
    const orders = await mongoose.connection.db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Get user data separately
    const userIds = orders.map(o => o.userId).filter(Boolean);
    const users = await mongoose.connection.db.collection('users')
      .find({ _id: { $in: userIds } })
      .toArray();
    
    // Map user data to orders
    const ordersWithUsers = orders.map(order => ({
      ...order,
      userId: users.find(u => u._id.toString() === order.userId?.toString()) || null
    }));
    
    return NextResponse.json(ordersWithUsers);
  } catch (error: any) {
    console.error('Orders API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, status, trackingNumber, courier, shippedAt } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    await connectDB();
    
    const updateData: any = { 
      status,
      updatedAt: new Date()
    };

    // Add timestamp based on status
    switch (status) {
      case 'confirmed':
        updateData.confirmedAt = new Date();
        break;
      case 'processing':
        updateData.processedAt = new Date();
        break;
      case 'shipped':
        updateData.shippedAt = shippedAt || new Date();
        if (trackingNumber) updateData.trackingNumber = trackingNumber;
        if (courier) updateData.courier = courier;
        break;
      case 'delivered':
        updateData.deliveredAt = new Date();
        break;
      case 'completed':
        updateData.completedAt = new Date();
        break;
      case 'payment_rejected':
        updateData.paymentRejectedAt = new Date();
        break;
    }
    
    const result = await mongoose.connection.db.collection('orders').updateOne(
      { _id: new mongoose.Types.ObjectId(orderId) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Order updated successfully' });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
