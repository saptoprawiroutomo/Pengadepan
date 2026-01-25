import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // Get orders data
    const orders = await Order.find(dateFilter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const completed = orders.filter(order => order.status === 'done').length;
    const pending = orders.filter(order => ['pending', 'processed'].includes(order.status)).length;
    const totalValue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Pemesanan</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .print-date { text-align: right; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>LAPORAN PEMESANAN</h1>
        <h2>Inter Media</h2>
        <p>Periode: ${startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Semua'} - ${endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Semua'}</p>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <h3>${totalOrders}</h3>
          <p>Total Pesanan</p>
        </div>
        <div class="summary-item">
          <h3>${completed}</h3>
          <p>Selesai</p>
        </div>
        <div class="summary-item">
          <h3>${pending}</h3>
          <p>Pending</p>
        </div>
        <div class="summary-item">
          <h3>Rp ${totalValue.toLocaleString('id-ID')}</h3>
          <p>Total Nilai</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Order ID</th>
            <th>Tanggal</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${orders.slice(0, 50).map((order, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${order.orderCode}</td>
              <td>${new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
              <td>${order.userId?.name || 'Customer'}</td>
              <td>${order.items?.length || 0} item</td>
              <td>${order.status}</td>
              <td>Rp ${(order.total || 0).toLocaleString('id-ID')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="print-date">
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
        }
      </script>
    </body>
    </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (error) {
    console.error('Print orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate print view' },
      { status: 500 }
    );
  }
}
