import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();

    // Count all collections
    const ordersCount = await mongoose.connection.db.collection('orders').countDocuments();
    const salesCount = await mongoose.connection.db.collection('salestransactions').countDocuments();
    const productsCount = await mongoose.connection.db.collection('products').countDocuments();

    // Get sample order
    const sampleOrder = await mongoose.connection.db.collection('orders')
      .findOne({}, { sort: { createdAt: -1 } });

    // Get sample sales transaction
    const sampleSales = await mongoose.connection.db.collection('salestransactions')
      .findOne({}, { sort: { createdAt: -1 } });

    // Get order statuses
    const orderStatuses = await mongoose.connection.db.collection('orders')
      .distinct('status');

    return NextResponse.json({
      counts: {
        orders: ordersCount,
        salesTransactions: salesCount,
        products: productsCount
      },
      orderStatuses,
      sampleOrder: sampleOrder ? {
        orderCode: sampleOrder.orderCode,
        status: sampleOrder.status,
        total: sampleOrder.total,
        itemsCount: sampleOrder.items?.length || 0,
        createdAt: sampleOrder.createdAt
      } : null,
      sampleSales: sampleSales ? {
        total: sampleSales.total || sampleSales.totalAmount,
        itemsCount: sampleSales.items?.length || 0,
        createdAt: sampleSales.createdAt || sampleSales.transactionDate
      } : null
    });

  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
