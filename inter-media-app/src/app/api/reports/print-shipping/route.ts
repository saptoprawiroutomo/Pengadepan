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

    // Get shipping data
    const shipments = await Order.find({
      ...dateFilter,
      $or: [
        { status: { $in: ['shipped', 'done', 'paid', 'processed'] } },
        { shippingAddress: { $exists: true, $ne: '' } }
      ]
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const totalShipments = shipments.length;
    const delivered = shipments.filter(order => order.status === 'done').length;
    const inTransit = shipments.filter(order => ['shipped', 'paid', 'processed'].includes(order.status)).length;
    const totalShippingCost = shipments.reduce((sum, order) => sum + (order.shippingCost || 0), 0);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Pengiriman</title>
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
        <h1>LAPORAN PENGIRIMAN</h1>
        <h2>Inter Media</h2>
        <p>Periode: ${startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Semua'} - ${endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Semua'}</p>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <h3>${totalShipments}</h3>
          <p>Total Pengiriman</p>
        </div>
        <div class="summary-item">
          <h3>${delivered}</h3>
          <p>Terkirim</p>
        </div>
        <div class="summary-item">
          <h3>${inTransit}</h3>
          <p>Dalam Perjalanan</p>
        </div>
        <div class="summary-item">
          <h3>Rp ${totalShippingCost.toLocaleString('id-ID')}</h3>
          <p>Total Ongkir</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Order ID</th>
            <th>Tanggal</th>
            <th>Customer</th>
            <th>Alamat Tujuan</th>
            <th>Kurir</th>
            <th>Status</th>
            <th>Ongkir</th>
          </tr>
        </thead>
        <tbody>
          ${shipments.map((order, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${order.orderCode}</td>
              <td>${new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
              <td>${order.userId?.name || 'Customer'}</td>
              <td>${order.shippingAddress || 'Alamat tidak tersedia'}</td>
              <td>${order.courier || order.shippingCourier || 'JNE'}</td>
              <td>${order.status === 'done' ? 'Terkirim' : order.status === 'shipped' ? 'Dikirim' : 'Diproses'}</td>
              <td>Rp ${(order.shippingCost || 0).toLocaleString('id-ID')}</td>
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
    console.error('Print shipping error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate print view' },
      { status: 500 }
    );
  }
}
