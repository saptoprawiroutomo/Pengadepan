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
    const db = mongoose.connection.db;

    // Get POS and Online transactions
    const posFilter = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};
    const posTransactions = await db.collection('salestransactions').find(posFilter).sort({ createdAt: -1 }).toArray();
    const onlineOrders = await db.collection('orders').find(posFilter).sort({ createdAt: -1 }).toArray();

    // Calculate totals
    const posRevenue = posTransactions.reduce((sum, txn) => sum + (txn.total || 0), 0);
    const onlineRevenue = onlineOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalRevenue = posRevenue + onlineRevenue;
    const totalTransactions = posTransactions.length + onlineOrders.length;

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
        .summary-value { font-size: 18px; font-weight: bold; color: #2563eb; }
        .comparison { display: flex; justify-content: space-around; margin: 20px 0; background: #f8f9fa; padding: 15px; }
        .comparison-item { text-align: center; }
        .section-title { font-size: 16px; font-weight: bold; margin: 20px 0 10px 0; color: #333; }
        .table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 11px; }
        .table th { background-color: #f5f5f5; font-weight: bold; }
        .pos-section { background-color: #e3f2fd; }
        .online-section { background-color: #f3e5f5; }
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

    <div class="comparison">
        <div class="comparison-item">
            <div style="font-weight: bold; color: #1976d2;">TRANSAKSI POS</div>
            <div>Jumlah: ${posTransactions.length}</div>
            <div>Revenue: Rp ${posRevenue.toLocaleString('id-ID')}</div>
        </div>
        <div class="comparison-item">
            <div style="font-weight: bold; color: #7b1fa2;">TRANSAKSI ONLINE</div>
            <div>Jumlah: ${onlineOrders.length}</div>
            <div>Revenue: Rp ${onlineRevenue.toLocaleString('id-ID')}</div>
        </div>
    </div>

    <div class="section-title pos-section" style="padding: 5px;">📟 TRANSAKSI POS</div>
    <table class="table">
        <thead>
            <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Tanggal</th>
                <th>Customer</th>
                <th>Kasir</th>
                <th>Items</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${posTransactions.map((transaction, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${transaction.transactionCode || 'POS-' + transaction._id.toString().slice(-6)}</td>
                    <td>${new Date(transaction.createdAt).toLocaleDateString('id-ID')}</td>
                    <td>${transaction.customerName || 'Walk-in'}</td>
                    <td>${transaction.cashierName || 'Kasir'}</td>
                    <td>${(transaction.items || []).map(item => 
                        (item.nameSnapshot || 'Product') + ' (' + (item.qty || 0) + 'x)'
                    ).join('<br>')}</td>
                    <td>Rp ${(transaction.total || 0).toLocaleString('id-ID')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="section-title online-section" style="padding: 5px;">🌐 TRANSAKSI ONLINE</div>
    <table class="table">
        <thead>
            <tr>
                <th>No</th>
                <th>Order ID</th>
                <th>Tanggal</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Items</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${onlineOrders.map((order, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${order.orderNumber || 'ORD-' + order._id.toString().slice(-6)}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                    <td>${order.customerInfo?.name || 'Customer'}</td>
                    <td>${order.status || 'pending'}</td>
                    <td>${(order.items || []).map(item => 
                        (item.nameSnapshot || 'Product') + ' (' + (item.quantity || 0) + 'x)'
                    ).join('<br>')}</td>
                    <td>Rp ${(order.total || 0).toLocaleString('id-ID')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        <p>Inter Medi-A - Laporan Penjualan (POS & Online)</p>
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
