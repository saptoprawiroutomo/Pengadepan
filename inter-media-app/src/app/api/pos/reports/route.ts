import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import SalesTransaction from '@/models/SalesTransaction';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const userSession = await getServerSession(authOptions);
    if (!userSession || userSession.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';

    await connectDB();

    let startDate = new Date();
    let endDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
    }

    // POS Sales
    const posSales = await SalesTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalTransactions: { $sum: 1 },
          averageTransaction: { $avg: '$total' }
        }
      }
    ]);

    // Online Orders
    const onlineOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrder: { $avg: '$total' }
        }
      }
    ]);

    // Daily breakdown
    const dailySales = await SalesTransaction.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          sales: { $sum: '$total' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const report = {
      period,
      dateRange: { startDate, endDate },
      pos: posSales[0] || { totalSales: 0, totalTransactions: 0, averageTransaction: 0 },
      online: onlineOrders[0] || { totalSales: 0, totalOrders: 0, averageOrder: 0 },
      dailyBreakdown: dailySales,
      summary: {
        totalRevenue: (posSales[0]?.totalSales || 0) + (onlineOrders[0]?.totalSales || 0),
        totalTransactions: (posSales[0]?.totalTransactions || 0) + (onlineOrders[0]?.totalOrders || 0)
      }
    };

    return NextResponse.json({ report });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
