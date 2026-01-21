import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectDB();

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const mongoose = require('mongoose');
    const salesTransactions = await mongoose.connection.db.collection('salestransactions')
      .find(Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {})
      .sort({ createdAt: -1 })
      .toArray();

    const totalRevenue = salesTransactions.reduce((sum, sale) => sum + (sale.total || sale.totalAmount || 0), 0);
    const totalTransactions = salesTransactions.length;

    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`
      : 'Semua Periode';

    const printHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Penjualan</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; }
        .report-title { font-size: 18px; margin-top: 10px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 20px; font-weight: bold; color: #2563eb; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        .table th { background-color: #f5f5f5; font-weight: bold; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">INTER MEDI-A</div>
        <div>Printer • Fotocopy • Komputer</div>
        <div class="report-title">LAPORAN PENJUALAN</div>
        <div>Periode: ${dateRange}</div>
    </div>

    <div class="summary">
        <div class="summary-item">
            <div class="summary-value">${totalTransactions}</div>
            <div>Total Transaksi</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">Rp ${totalRevenue.toLocaleString('id-ID')}</div>
            <div>Total Pendapatan</div>
        </div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>No</th>
                <th>Kode Transaksi</th>
                <th>Tanggal</th>
                <th>Pembeli</th>
                <th>Items</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${salesTransactions.map((transaction, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${transaction.transactionCode || 'TXN-' + transaction._id.toString().slice(-6)}</td>
                    <td>${new Date(transaction.createdAt).toLocaleDateString('id-ID')}</td>
                    <td>${transaction.customerName || 'Walk-in Customer'}</td>
                    <td>${(transaction.items || []).map(item => 
                        (item.nameSnapshot || 'Product') + ' (' + (item.qty || item.quantity || 0) + 'x)'
                    ).join('<br>')}</td>
                    <td>Rp ${(transaction.total || transaction.totalAmount || 0).toLocaleString('id-ID')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        <p>Inter Medi-A - Laporan Penjualan</p>
    </div>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`;

    return new NextResponse(printHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error: any) {
    console.error('Print sales error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
