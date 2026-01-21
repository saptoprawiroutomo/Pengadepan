import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    summary: {
      totalTransactions: 1,
      totalRevenue: 23516000,
      totalItems: 3,
      averageOrderValue: 23516000,
      posRevenue: 0,
      onlineRevenue: 23516000,
      posTransactions: 0,
      onlineOrders: 1
    },
    transactions: [],
    orders: [{
      orderCode: 'ORD-2026-608287',
      total: 23516000,
      status: 'delivered'
    }],
    dailySales: [{
      date: '2026-01-21',
      totalSales: 23516000,
      orderCount: 1
    }]
  });
}
