import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET() {
  try {
    await connectDB();
    
    // Get ALL orders
    const orders = await Order.find({}).sort({ createdAt: -1 });
    
    // Calculate from real data
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalTransactions = orders.length;
    
    return NextResponse.json({
      success: true,
      totalRevenue,
      totalTransactions,
      orders: orders.map(o => ({
        orderCode: o.orderCode,
        total: o.total,
        status: o.status
      }))
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
