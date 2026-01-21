import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();

    // Get all orders
    const allOrders = await mongoose.connection.db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate simple total
    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + (order.total || 0);
    }, 0);

    const totalTransactions = allOrders.length;

    return NextResponse.json({
      totalOrders: allOrders.length,
      totalRevenue,
      totalTransactions,
      orders: allOrders.map(order => ({
        orderCode: order.orderCode,
        status: order.status,
        total: order.total,
        createdAt: order.createdAt
      }))
    });

  } catch (error: any) {
    console.error('Simple reports error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
