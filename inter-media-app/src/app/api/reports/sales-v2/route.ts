import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get ALL orders without any filter
    const orders = await Order.find({}).sort({ createdAt: -1 });
    
    console.log('V2 API - Found orders:', orders.length);
    
    // Calculate summary from all orders
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalTransactions = orders.length;
    const totalItems = orders.reduce((sum, order) => {
      return sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0);
    }, 0);
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return NextResponse.json({
      summary: {
        totalRevenue,
        totalTransactions,
        totalItems,
        averageOrderValue
      },
      orders: orders.map(order => ({
        orderCode: order.orderCode,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      })),
      debug: {
        message: 'V2 API working',
        totalOrdersFound: orders.length,
        calculatedRevenue: totalRevenue
      }
    });

  } catch (error: any) {
    console.error('Sales V2 API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sales data', 
      details: error.message 
    }, { status: 500 });
  }
}
