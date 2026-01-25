import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectDB();

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    // Get POS transactions
    const posFilter = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    const posTransactions = await db.collection('salestransactions').find(posFilter).sort({ createdAt: -1 }).toArray();

    // Get Online orders
    const onlineOrders = await db.collection('orders').find(posFilter).sort({ createdAt: -1 }).toArray();

    // Prepare POS data
    const posData = posTransactions.map((transaction: any) => ({
      'Tipe': 'POS',
      'Kode': transaction.transactionCode || `POS-${transaction._id?.toString().slice(-6)}`,
      'Tanggal': new Date(transaction.createdAt).toLocaleDateString('id-ID'),
      'Customer': transaction.customerName || 'Walk-in Customer',
      'Kasir': transaction.cashierName || 'Kasir',
      'Items': (transaction.items || []).map((item: any) => 
        `${item.nameSnapshot || 'Product'} (${item.qty || 0}x)`
      ).join(', '),
      'Payment': transaction.paymentMethod || 'cash',
      'Total': transaction.total || 0
    }));

    // Prepare Online data
    const onlineData = onlineOrders.map((order: any) => ({
      'Tipe': 'Online',
      'Kode': order.orderNumber || `ORD-${order._id?.toString().slice(-6)}`,
      'Tanggal': new Date(order.createdAt).toLocaleDateString('id-ID'),
      'Customer': order.customerInfo?.name || 'Customer',
      'Kasir': '-',
      'Items': (order.items || []).map((item: any) => 
        `${item.nameSnapshot || 'Product'} (${item.quantity || 0}x)`
      ).join(', '),
      'Payment': order.paymentMethod || 'transfer',
      'Total': order.total || 0
    }));

    // Calculate summary
    const posTotal = posTransactions.reduce((sum, txn) => sum + (txn.total || 0), 0);
    const onlineTotal = onlineOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    const summaryData = [
      { 'Kategori': 'Transaksi POS', 'Jumlah': posTransactions.length, 'Total': posTotal },
      { 'Kategori': 'Transaksi Online', 'Jumlah': onlineOrders.length, 'Total': onlineTotal },
      { 'Kategori': 'TOTAL', 'Jumlah': posTransactions.length + onlineOrders.length, 'Total': posTotal + onlineTotal }
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan');

    // Combined transactions sheet
    const allData = [...posData, ...onlineData].sort((a, b) => b.Tanggal.localeCompare(a.Tanggal));
    const allWs = XLSX.utils.json_to_sheet(allData);
    allWs['!cols'] = [
      { wch: 8 },  // Tipe
      { wch: 15 }, // Kode
      { wch: 12 }, // Tanggal
      { wch: 20 }, // Customer
      { wch: 15 }, // Kasir
      { wch: 40 }, // Items
      { wch: 10 }, // Payment
      { wch: 15 }  // Total
    ];
    XLSX.utils.book_append_sheet(wb, allWs, 'Semua Transaksi');

    // POS only sheet
    if (posData.length > 0) {
      const posWs = XLSX.utils.json_to_sheet(posData);
      posWs['!cols'] = allWs['!cols'];
      XLSX.utils.book_append_sheet(wb, posWs, 'Transaksi POS');
    }

    // Online only sheet
    if (onlineData.length > 0) {
      const onlineWs = XLSX.utils.json_to_sheet(onlineData);
      onlineWs['!cols'] = allWs['!cols'];
      XLSX.utils.book_append_sheet(wb, onlineWs, 'Transaksi Online');
    }

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    const filename = `laporan-penjualan-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error: any) {
    console.error('Export Excel error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
