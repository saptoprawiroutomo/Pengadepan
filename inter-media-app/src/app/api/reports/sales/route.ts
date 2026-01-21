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
    
    // Get completed orders - REMOVE status filter temporarily for debugging
    console.log('Querying orders with filter:', dateFilter);
    
    const allOrders = await mongoose.connection.db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('All orders found:', allOrders.length);
    allOrders.forEach(order => {
      console.log(`Order ${order.orderCode}: status=${order.status}, total=${order.total}`);
    });
    
    // Use ALL orders for calculation instead of filtering by status
    const completedOrders = allOrders;
    
    // Calculate summary from both POS and online orders
    const posRevenue = salesTransactions.reduce((sum, sale) => sum + (sale.total || sale.totalAmount || 0), 0);
    
    console.log('Completed orders for calculation:', completedOrders.length);
    const onlineRevenue = completedOrders.reduce((sum, order) => {
      const orderTotal = Number(order.total) || 0;
      console.log(`Order ${order.orderCode}: total=${orderTotal}`);
      return sum + orderTotal;
    }, 0);
    
    console.log('POS Revenue:', posRevenue);
    console.log('Online Revenue:', onlineRevenue);
    
    const totalRevenue = posRevenue + onlineRevenue;
    const totalTransactions = salesTransactions.length + completedOrders.length;
    
    const posItems = salesTransactions.reduce((sum, sale) => 
      sum + (sale.items?.reduce((itemSum, item) => itemSum + (Number(item.qty) || Number(item.quantity) || 0), 0) || 0), 0);
    const onlineItems = completedOrders.reduce((sum, order) => 
      sum + (order.items?.reduce((itemSum, item) => itemSum + (Number(item.qty) || 0), 0) || 0), 0);
    
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
