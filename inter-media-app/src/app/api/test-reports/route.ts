import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();

    // Get orders directly
    const orders = await mongoose.connection.db.collection('orders')
      .find({})
      .toArray();

    // Simple calculation
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (Number(order.total) || 0);
    }, 0);

    const totalTransactions = orders.length;

    // Return simple structure
    return NextResponse.json({
      success: true,
      totalOrders: orders.length,
      totalRevenue: totalRevenue,
      totalTransactions: totalTransactions,
      orders: orders.map(o => ({
        orderCode: o.orderCode,
        total: o.total,
        status: o.status
      }))
    });

  } catch (error: any) {
    return NextResponse.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
}
