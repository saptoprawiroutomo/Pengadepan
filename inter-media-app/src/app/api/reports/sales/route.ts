import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Use raw MongoDB query to get REAL data
    const db = mongoose.connection.db;
    const orders = await db.collection('orders').find({}).toArray();
    
    console.log('REAL DATA - Found orders:', orders.length);
    
    // Calculate summary from REAL orders
    const totalRevenue = orders.reduce((sum, order) => {
      const orderTotal = Number(order.total) || 0;
      console.log(`Real order ${order.orderCode}: ${orderTotal}`);
      return sum + orderTotal;
    }, 0);
    
    const totalTransactions = orders.length;
    const totalItems = orders.reduce((sum, order) => {
      const itemCount = order.items?.reduce((itemSum, item) => {
        return itemSum + (Number(item.qty) || Number(item.quantity) || 0);
      }, 0) || 0;
      return sum + itemCount;
    }, 0);
    
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    console.log('REAL CALCULATION:', { totalRevenue, totalTransactions, totalItems });

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalTransactions,
        totalItems,
        averageOrderValue
      },
      transactions: orders.map(order => ({
        id: order._id,
        orderCode: order.orderCode,
        customerName: order.customerInfo?.name,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items
      })),
      debug: {
        message: "REAL DATABASE DATA",
        totalOrdersFound: orders.length,
        calculatedRevenue: totalRevenue,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('Sales report error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sales data', 
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
