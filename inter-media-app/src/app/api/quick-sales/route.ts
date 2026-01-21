import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    
    // Direct MongoDB query
    const db = mongoose.connection.db;
    const orders = await db.collection('orders').find({}).toArray();
    
    const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    
    return NextResponse.json({
      success: true,
      totalRevenue,
      totalOrders: orders.length,
      message: 'Direct MongoDB query working',
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      timestamp: Date.now()
    }, { status: 500 });
  }
}
