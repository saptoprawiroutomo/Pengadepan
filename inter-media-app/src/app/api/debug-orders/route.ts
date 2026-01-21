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
      .limit(10)
      .toArray();

    // Get order status counts
    const statusCounts = await mongoose.connection.db.collection('orders')
      .aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$total' } } }
      ]).toArray();

    // Get POS transactions
    const posTransactions = await mongoose.connection.db.collection('salestransactions')
      .find({})
      .limit(5)
      .toArray();

    return NextResponse.json({
      recentOrders: allOrders.map(order => ({
        orderCode: order.orderCode,
        status: order.status,
        total: order.total,
        itemsCount: order.items?.length || 0,
        createdAt: order.createdAt
      })),
      statusCounts,
      posTransactionsCount: posTransactions.length,
      samplePosTransaction: posTransactions[0] || null
    });

  } catch (error: any) {
    console.error('Debug orders error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
