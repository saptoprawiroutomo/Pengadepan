import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // Get orders data
    const orders = await Order.find(dateFilter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate summary
    const totalOrders = orders.length;
    const completed = orders.filter(order => order.status === 'done').length;
    const pending = orders.filter(order => ['pending', 'processed'].includes(order.status)).length;
    const totalValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Daily orders
    const dailyOrders = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 30 }
    ]);

    // Recent orders
    const recentOrders = orders.slice(0, 20).map(order => ({
      orderNumber: order.orderCode,
      customerName: order.userId?.name || 'Customer',
      status: order.status,
      totalAmount: order.total,
      itemCount: order.items?.length || 0,
      createdAt: order.createdAt
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalOrders,
        completed,
        pending,
        avgOrderValue
      },
      ordersByStatus,
      dailyOrders: dailyOrders.map(day => ({
        date: day._id,
        count: day.count,
        total: day.total
      })),
      recentOrders
    });

  } catch (error) {
    console.error('Orders report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate orders report' },
      { status: 500 }
    );
  }
}
