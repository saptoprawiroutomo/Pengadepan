import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth for debugging
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    let dateFilter = {};
    // Temporarily disable date filter for debugging
    // if (startDate || endDate) {
    //   dateFilter = { createdAt: {} };
    //   if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
    //   if (endDate) dateFilter.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
    // }

    // Get sales transactions
    const salesTransactions = await mongoose.connection.db.collection('salestransactions')
      .find(dateFilter)
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('Found sales transactions:', salesTransactions.length);
    
    // Get completed orders (include pending, confirmed, shipped, and delivered)
    const completedOrders = await mongoose.connection.db.collection('orders')
      .find({ 
        ...dateFilter,
        status: { 
          $in: ['pending', 'confirmed', 'shipped', 'delivered'] 
        } 
      })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('Found completed orders:', completedOrders.length);
    
    // Calculate summary from both POS and online orders
    const posRevenue = salesTransactions.reduce((sum, sale) => sum + (sale.total || sale.totalAmount || 0), 0);
    const onlineRevenue = completedOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    const totalRevenue = posRevenue + onlineRevenue;
    const totalTransactions = salesTransactions.length + completedOrders.length;
    
    const posItems = salesTransactions.reduce((sum, sale) => 
      sum + (sale.items?.reduce((itemSum, item) => itemSum + (item.qty || item.quantity || 0), 0) || 0), 0);
    const onlineItems = completedOrders.reduce((sum, order) => 
      sum + (order.items?.reduce((itemSum, item) => itemSum + (item.qty || 0), 0) || 0), 0);
    
    const totalItems = posItems + onlineItems;
    
    // Daily sales from both POS and online orders
    const dailySales = {};
    
    // Add POS transactions
    salesTransactions.forEach(sale => {
      const date = new Date(sale.createdAt || sale.transactionDate).toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { date, totalSales: 0, orderCount: 0, posCount: 0, onlineCount: 0 };
      }
      dailySales[date].totalSales += (sale.total || sale.totalAmount || 0);
      dailySales[date].orderCount += 1;
      dailySales[date].posCount += 1;
    });
    
    // Add online orders
    completedOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailySales[date]) {
        dailySales[date] = { date, totalSales: 0, orderCount: 0, posCount: 0, onlineCount: 0 };
      }
      dailySales[date].totalSales += (order.total || 0);
      dailySales[date].orderCount += 1;
      dailySales[date].onlineCount += 1;
    });

    return NextResponse.json({
      summary: {
        totalTransactions,
        totalRevenue,
        totalItems,
        averageOrderValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
        posRevenue,
        onlineRevenue,
        posTransactions: salesTransactions.length,
        onlineOrders: completedOrders.length
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
