import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    console.log('Sales API called with dates:', { startDate, endDate });

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate + 'T23:59:59.999Z')
        }
      };
    }

    // Get ALL orders (not filtered by status) to show real data
    const orders = await Order.find(dateFilter).sort({ createdAt: -1 });
    
    console.log('Found orders:', orders.length);
    orders.forEach(order => {
      console.log(`Order ${order.orderCode}: status=${order.status}, total=${order.total}`);
    });

    // Calculate summary from all orders
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalTransactions = orders.length;
    const totalItems = orders.reduce((sum, order) => {
      return sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0);
    }, 0);
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    console.log('Calculated summary:', {
      totalRevenue,
      totalTransactions,
      totalItems,
      averageOrderValue
    });

    const summary = {
      totalRevenue,
      totalTransactions,
      totalItems,
      averageOrderValue
    };

    // Get daily sales data
    const dailySales = orders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, totalSales: 0, orderCount: 0 };
      }
      acc[date].totalSales += order.total || 0;
      acc[date].orderCount += 1;
      return acc;
    }, {});

    return NextResponse.json({
      summary,
      dailySales: Object.values(dailySales),
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
        totalOrdersFound: orders.length,
        dateFilter,
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
