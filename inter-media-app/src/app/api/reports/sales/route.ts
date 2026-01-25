import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = end;
      }
    }
    
    console.log('Date filter applied:', dateFilter);
    console.log('Start date:', startDate);
    console.log('End date:', endDate);
    
    const db = mongoose.connection.db;
    
    // Get POS transactions (SalesTransaction collection)
    const posTransactions = await db.collection('salestransactions').find(dateFilter).toArray();
    
    // Get Online orders (Orders collection)  
    const onlineOrders = await db.collection('orders').find(dateFilter).toArray();
    
    console.log('POS Transactions found:', posTransactions.length);
    console.log('Online Orders found:', onlineOrders.length);
    
    // If no date filter, show sample of dates in data
    if (!startDate && !endDate) {
      const samplePos = await db.collection('salestransactions').find().limit(3).toArray();
      const sampleOrders = await db.collection('orders').find().limit(3).toArray();
      console.log('Sample POS dates:', samplePos.map(t => t.createdAt));
      console.log('Sample Order dates:', sampleOrders.map(o => o.createdAt));
    }
    
    // Calculate POS summary
    const posRevenue = posTransactions.reduce((sum, txn) => sum + (Number(txn.total) || 0), 0);
    const posCount = posTransactions.length;
    const posAverage = posCount > 0 ? posRevenue / posCount : 0;
    
    // Calculate Online summary - handle both total and totalAmount fields
    const onlineRevenue = onlineOrders.reduce((sum, order) => {
      const amount = Number(order.total) || Number(order.totalAmount) || 0;
      return sum + amount;
    }, 0);
    const onlineCount = onlineOrders.length;
    const onlineAverage = onlineCount > 0 ? onlineRevenue / onlineCount : 0;
    
    // Total summary
    const totalRevenue = posRevenue + onlineRevenue;
    const totalTransactions = posCount + onlineCount;
    
    // Daily sales breakdown
    const dailySalesMap = new Map();
    
    // Process POS transactions
    posTransactions.forEach(txn => {
      const date = new Date(txn.createdAt).toISOString().split('T')[0];
      if (!dailySalesMap.has(date)) {
        dailySalesMap.set(date, { date, posSales: 0, onlineSales: 0, totalSales: 0 });
      }
      const day = dailySalesMap.get(date);
      day.posSales += Number(txn.total) || 0;
      day.totalSales += Number(txn.total) || 0;
    });
    
    // Process Online orders
    onlineOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailySalesMap.has(date)) {
        dailySalesMap.set(date, { date, posSales: 0, onlineSales: 0, totalSales: 0 });
      }
      const day = dailySalesMap.get(date);
      const amount = Number(order.total) || Number(order.totalAmount) || 0;
      day.onlineSales += amount;
      day.totalSales += amount;
    });
    
    const dailySales = Array.from(dailySalesMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    return NextResponse.json({
      summary: {
        totalRevenue,
        totalTransactions,
        posTransactions: posCount,
        onlineTransactions: onlineCount,
        posRevenue,
        onlineRevenue,
        posAverage,
        onlineAverage
      },
      dailySales,
      posTransactions: posTransactions.map(txn => ({
        _id: txn._id,
        transactionCode: txn.transactionCode,
        cashierName: txn.cashierName,
        customerName: txn.customerName,
        total: txn.total,
        items: txn.items,
        createdAt: txn.createdAt
      })),
      onlineTransactions: onlineOrders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customerName: order.customerInfo?.name || order.customerName,
        userId: order.userId,
        status: order.status,
        totalAmount: Number(order.total) || Number(order.totalAmount) || 0,
        items: order.items,
        createdAt: order.createdAt
      }))
    });

  } catch (error: any) {
    console.error('Sales report error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch sales data', 
      details: error.message
    }, { status: 500 });
  }
}
