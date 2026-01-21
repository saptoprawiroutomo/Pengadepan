import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Get ALL orders without any filter to show real data
    const orders = await Order.find({}).sort({ createdAt: -1 });
    
    // Calculate summary from all orders
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalTransactions = orders.length;
    const totalItems = orders.reduce((sum, order) => {
      return sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0);
    }, 0);
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const summary = {
      totalRevenue,
      totalTransactions,
      totalItems,
      averageOrderValue
    };

    return NextResponse.json({
      summary,
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
        message: 'FIXED - Using real order data',
        totalOrdersFound: orders.length,
        calculatedRevenue: totalRevenue
      }
    });

  } catch (error: any) {
    console.error('Sales report error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sales data', 
      details: error.message 
    }, { status: 500 });
  }
}
