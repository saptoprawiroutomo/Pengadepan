import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectDB();

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const matchStage = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Sales from orders (all paid orders)
    const salesOrders = await Order.aggregate([
      { 
        $match: { 
          ...matchStage,
          status: { $in: ['paid', 'processed', 'shipped', 'done'] }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          totalShipping: { $sum: '$shippingCost' },
          totalSubtotal: { $sum: '$subtotal' },
          orders: { $push: '$$ROOT' }
        }
      }
    ]);

    // Daily sales aggregation
    const dailySales = await Order.aggregate([
      { 
        $match: { 
          ...matchStage,
          status: { $in: ['paid', 'processed', 'shipped', 'done'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Payment method breakdown
    const paymentBreakdown = await Order.aggregate([
      { 
        $match: { 
          ...matchStage,
          status: { $in: ['paid', 'processed', 'shipped', 'done'] }
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    const orderData = salesOrders[0] || { 
      totalOrders: 0, 
      totalRevenue: 0, 
      totalShipping: 0,
      totalSubtotal: 0,
      orders: [] 
    };

    return NextResponse.json({
      summary: {
        totalTransactions: orderData.totalOrders,
        totalRevenue: orderData.totalRevenue,
        totalShipping: orderData.totalShipping,
        totalSubtotal: orderData.totalSubtotal,
        averageOrderValue: orderData.totalOrders > 0 ? orderData.totalRevenue / orderData.totalOrders : 0
      },
      dailySales,
      paymentBreakdown,
      orders: orderData.orders.slice(0, 10) // Latest 10 orders
    });

  } catch (error: any) {
    console.error('Sales report error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
