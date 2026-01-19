import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const matchStage = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const orders = await Order.find({
      ...matchStage,
      status: { $in: ['paid', 'processed', 'shipped', 'done'] }
    }).populate('userId', 'name email').sort({ createdAt: -1 });

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalSubtotal = orders.reduce((sum, order) => sum + order.subtotal, 0);
    const totalShipping = orders.reduce((sum, order) => sum + order.shippingCost, 0);

    const dateRange = startDate && endDate 
      ? `${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`
      : 'Semua Data';

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Penjualan - Inter Medi-A</title>
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
        @media print { body { margin: 0; } .no-print { display: none; } }
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
            <div class="summary-value">${orders.length}</div>
            <div>Total Transaksi</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">Rp ${totalRevenue.toLocaleString('id-ID')}</div>
            <div>Total Pendapatan</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">Rp ${totalSubtotal.toLocaleString('id-ID')}</div>
            <div>Subtotal Produk</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">Rp ${totalShipping.toLocaleString('id-ID')}</div>
            <div>Total Ongkir</div>
        </div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>No</th>
                <th>Kode Order</th>
                <th>Tanggal</th>
                <th>Customer</th>
                <th>Subtotal</th>
                <th>Ongkir</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${orders.map((order, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${order.orderCode}</td>
                    <td>${new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
                    <td>${order.userId?.name || 'N/A'}</td>
                    <td>Rp ${order.subtotal.toLocaleString('id-ID')}</td>
                    <td>Rp ${order.shippingCost.toLocaleString('id-ID')}</td>
                    <td>Rp ${order.total.toLocaleString('id-ID')}</td>
                    <td>${order.paymentMethod === 'transfer' ? 'Transfer' : 'COD'}</td>
                    <td>${order.status.toUpperCase()}</td>
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
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
