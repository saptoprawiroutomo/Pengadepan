import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status, trackingNumber, courier, shippedAt } = await request.json();

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
      { _id: new mongoose.Types.ObjectId(params.id) },
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
