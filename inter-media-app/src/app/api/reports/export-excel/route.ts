import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

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

    // Get sales transactions
    const mongoose = require('mongoose');
    const salesTransactions = await mongoose.connection.db.collection('salestransactions')
      .find(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
      .sort({ createdAt: -1 })
      .toArray();

    // Prepare Excel data
    const excelData = salesTransactions.map((transaction: any) => ({
      'Kode Transaksi': transaction.transactionCode || `TXN-${transaction._id?.toString().slice(-6)}`,
      'Tanggal': new Date(transaction.createdAt).toLocaleDateString('id-ID'),
      'Pembeli': transaction.customerName || 'Walk-in Customer',
      'Items': (transaction.items || []).map((item: any) => 
        `${item.nameSnapshot || 'Product'} (${item.qty || item.quantity || 0}x)`
      ).join(', '),
      'Total': transaction.total || transaction.totalAmount || 0
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-width columns
    const colWidths = [
      { wch: 20 }, // Kode Transaksi
      { wch: 12 }, // Tanggal
      { wch: 20 }, // Pembeli
      { wch: 40 }, // Items
      { wch: 15 }  // Total
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penjualan');

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
