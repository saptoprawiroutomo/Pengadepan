import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import * as XLSX from 'xlsx';

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
      status: { $in: ['shipped', 'done'] }
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Prepare data for Excel
    const excelData = shipments.map((order, index) => ({
      'No': index + 1,
      'Order ID': order.orderCode,
      'Tanggal Kirim': new Date(order.shippedAt || order.createdAt).toLocaleDateString('id-ID'),
      'Customer': order.userId?.name || 'Customer',
      'Alamat Tujuan': order.shippingAddress || 'Alamat tidak tersedia',
      'Kurir': order.courier || order.shippingCourier || 'JNE',
      'Status': order.status === 'done' ? 'Terkirim' : 'Dikirim',
      'Ongkir': order.shippingCost || 0,
      'Total Order': order.total || 0
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 15 },  // Order ID
      { wch: 12 },  // Tanggal
      { wch: 20 },  // Customer
      { wch: 30 },  // Alamat
      { wch: 10 },  // Kurir
      { wch: 10 },  // Status
      { wch: 12 },  // Ongkir
      { wch: 15 }   // Total
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pengiriman');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="laporan-pengiriman-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Export shipping error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export shipping data' },
      { status: 500 }
    );
  }
}
