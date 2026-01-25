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

    // Get payment data from orders
    const orders = await Order.find(dateFilter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Calculate summary
    const totalPayments = orders.length;
    const successful = orders.filter(order => order.status === 'paid' || order.status === 'processed' || order.status === 'shipped' || order.status === 'done').length;
    const failed = orders.filter(order => order.status === 'cancelled').length;
    const totalAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    // Payment methods aggregation
    const paymentMethods = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Payment status aggregation (using order status as proxy)
    const paymentStatus = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent payments
    const recentPayments = orders
      .filter(order => ['paid', 'processed', 'shipped', 'done'].includes(order.status))
      .slice(0, 20)
      .map(order => ({
        orderNumber: order.orderCode,
        customerName: order.userId?.name || 'Customer',
        paymentMethod: order.paymentMethod || 'Transfer Bank',
        paymentStatus: order.status === 'done' ? 'paid' : 'pending',
        totalAmount: order.total,
        paidAt: order.updatedAt,
        createdAt: order.createdAt
      }));

    return NextResponse.json({
      success: true,
      summary: {
        totalPayments,
        successful,
        failed,
        totalAmount
      },
      paymentMethods,
      paymentStatus,
      recentPayments
    });

  } catch (error) {
    console.error('Payments report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate payments report' },
      { status: 500 }
    );
  }
}
