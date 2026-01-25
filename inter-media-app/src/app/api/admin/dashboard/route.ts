import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import SalesTransaction from '@/models/SalesTransaction';

export async function GET(request: NextRequest) {
  try {
    const userSession = await getServerSession(authOptions);
    if (!userSession || userSession.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get this month's date range
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Dashboard stats
    const [
      totalProducts,
      totalUsers,
      todayOrders,
      monthlyOrders,
      todayRevenue,
      monthlyRevenue,
      lowStockProducts,
      recentOrders
    ] = await Promise.all([
      // Total products
      Product.countDocuments({ isActive: true }),
      
      // Total users
      User.countDocuments({ role: 'user' }),
      
      // Today's orders
      Order.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      }),
      
      // Monthly orders
      Order.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      }),
      
      // Today's revenue (orders + POS)
      Promise.all([
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfDay, $lte: endOfDay },
              status: { $in: ['completed', 'delivered'] }
            }
          },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        SalesTransaction.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfDay, $lte: endOfDay }
            }
          },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ])
      ]).then(([orders, pos]) => 
        (orders[0]?.total || 0) + (pos[0]?.total || 0)
      ),
      
      // Monthly revenue
      Promise.all([
        Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfMonth, $lte: endOfMonth },
              status: { $in: ['completed', 'delivered'] }
            }
          },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        SalesTransaction.aggregate([
          {
            $match: {
              createdAt: { $gte: startOfMonth, $lte: endOfMonth }
            }
          },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ])
      ]).then(([orders, pos]) => 
        (orders[0]?.total || 0) + (pos[0]?.total || 0)
      ),
      
      // Low stock products
      Product.find({ stock: { $lte: 10 }, isActive: true })
        .select('name stock')
        .limit(10),
      
      // Recent orders
      Order.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .select('orderCode total status createdAt userId')
    ]);

    const dashboard = {
      stats: {
        totalProducts,
        totalUsers,
        todayOrders,
        monthlyOrders,
        todayRevenue,
        monthlyRevenue
      },
      lowStockProducts,
      recentOrders,
      lastUpdated: new Date()
    };

    return NextResponse.json({ dashboard });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
