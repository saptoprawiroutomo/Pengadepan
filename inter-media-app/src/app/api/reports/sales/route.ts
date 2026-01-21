import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await connectDB();

    // Get sales transactions
    const salesTransactions = await mongoose.connection.db.collection('salestransactions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('Found sales transactions:', salesTransactions.length);
    
    // Get completed orders
    const completedOrders = await mongoose.connection.db.collection('orders')
      .find({ status: 'delivered' })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('Found completed orders:', completedOrders.length);
    
    // Calculate summary
    const totalSales = salesTransactions.reduce((sum, sale) => sum + (sale.total || sale.totalAmount || 0), 0);
    const totalTransactions = salesTransactions.length;
    const totalItems = salesTransactions.reduce((sum, sale) => 
      sum + (sale.items?.reduce((itemSum, item) => itemSum + (item.qty || item.quantity || 0), 0) || 0), 0);
    
    // Daily sales
    const dailySales = salesTransactions.reduce((acc, sale) => {
      const date = new Date(sale.createdAt || sale.transactionDate).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, totalSales: 0, orderCount: 0 };
      }
      acc[date].totalSales += (sale.total || sale.totalAmount || 0);
      acc[date].orderCount += 1;
      return acc;
    }, {});

    return NextResponse.json({
      summary: {
        totalTransactions,
        totalRevenue: totalSales,
        totalItems,
        averageOrderValue: totalTransactions > 0 ? totalSales / totalTransactions : 0
      },
      transactions: salesTransactions,
      orders: completedOrders,
      dailySales: Object.values(dailySales)
    });

  } catch (error: any) {
    console.error('Sales report error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
