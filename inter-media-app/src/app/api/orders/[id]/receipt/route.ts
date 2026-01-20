import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const order = await Order.findOne({ 
      _id: id, 
      userId: session.user.id 
    }).populate('items.productId', 'name');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Generate HTML receipt
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resi Pembelian - ${order.orderCode}</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .receipt-title { font-size: 18px; margin-top: 10px; }
        .order-info { display: flex; justify-content: space-between; margin-bottom: 20px; }
        .order-info div { flex: 1; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items-table th { background-color: #f5f5f5; }
        .total-section { text-align: right; margin-top: 20px; }
        .total-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .total-final { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">INTER MEDI-A</div>
        <div>Printer • Fotocopy • Komputer</div>
        <div class="receipt-title">RESI PEMBELIAN</div>
    </div>

    <div class="order-info">
        <div>
            <strong>Order Code:</strong> ${order.orderCode}<br>
            <strong>Tanggal:</strong> ${new Date(order.createdAt).toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric', 
              month: 'long',
              day: 'numeric'
            })}<br>
            <strong>Status:</strong> ${order.status.toUpperCase()}
        </div>
        <div>
            <strong>Customer:</strong> ${session.user.name}<br>
            <strong>Email:</strong> ${session.user.email}<br>
            <strong>Payment:</strong> ${order.paymentMethod === 'transfer' ? 'Transfer Bank' : 'COD'}
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Produk</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${order.items.map((item: any) => `
                <tr>
                    <td>${item.nameSnapshot}</td>
                    <td>${item.qty}</td>
                    <td>Rp ${item.priceSnapshot.toLocaleString('id-ID')}</td>
                    <td>Rp ${item.subtotal.toLocaleString('id-ID')}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="total-section">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>Rp ${order.subtotal.toLocaleString('id-ID')}</span>
        </div>
        <div class="total-row">
            <span>Ongkos Kirim:</span>
            <span>Rp ${order.shippingCost.toLocaleString('id-ID')}</span>
        </div>
        <div class="total-row total-final">
            <span>TOTAL:</span>
            <span>Rp ${order.total.toLocaleString('id-ID')}</span>
        </div>
    </div>

    <div style="margin-top: 20px;">
        <strong>Alamat Pengiriman:</strong><br>
        ${order.shippingAddress}
    </div>

    ${order.trackingNumber ? `
    <div style="margin-top: 20px;">
        <strong>Informasi Pengiriman:</strong><br>
        Kurir: ${order.courier || 'N/A'}<br>
        No. Resi: ${order.trackingNumber}
    </div>
    ` : ''}

    <div class="footer">
        <p>Terima kasih atas kepercayaan Anda berbelanja di Inter Medi-A</p>
        <p>Untuk pertanyaan, hubungi WhatsApp: +62 895-3339-61424</p>
    </div>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`;

    return new NextResponse(receiptHTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });

  } catch (error: any) {
    console.error('Receipt error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
