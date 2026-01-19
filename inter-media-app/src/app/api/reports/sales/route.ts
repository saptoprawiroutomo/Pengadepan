import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import SalesTransaction from '@/models/SalesTransaction';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
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

    const matchStage = dateFilter.createdAt ? { createdAt: dateFilter } : {};

    // Sales from POS transactions
    const posTransactions = await SalesTransaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          transactions: { $push: '$$ROOT' }
        }
      }
    ]);

    // Sales from online orders (completed only)
    const onlineOrders = await Order.aggregate([
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
          orders: { $push: '$$ROOT' }
        }
      }
    ]);

    // Daily sales aggregation
    const dailySales = await SalesTransaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalSales: { $sum: '$total' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const posData = posTransactions[0] || { totalTransactions: 0, totalRevenue: 0, transactions: [] };
    const orderData = onlineOrders[0] || { totalOrders: 0, totalRevenue: 0, orders: [] };

    return NextResponse.json({
      summary: {
        totalTransactions: posData.totalTransactions + orderData.totalOrders,
        totalRevenue: posData.totalRevenue + orderData.totalRevenue,
        posTransactions: posData.totalTransactions,
        posRevenue: posData.totalRevenue,
        onlineOrders: orderData.totalOrders,
        onlineRevenue: orderData.totalRevenue
      },
      dailySales,
      transactions: posData.transactions,
      orders: orderData.orders
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
