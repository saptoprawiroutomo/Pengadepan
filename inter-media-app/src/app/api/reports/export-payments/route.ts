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

    // Get payment data
    const orders = await Order.find(dateFilter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Prepare data for Excel
    const excelData = orders.map((order, index) => ({
      'No': index + 1,
      'Order ID': order.orderCode,
      'Tanggal': new Date(order.createdAt).toLocaleDateString('id-ID'),
      'Customer': order.userId?.name || 'Customer',
      'Payment Method': order.paymentMethod || 'Transfer Bank',
      'Status': order.status,
      'Total Amount': order.total || 0,
      'Updated At': order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('id-ID') : '',
      'Admin Notes': order.adminNotes || ''
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
      { wch: 15 },  // Payment Method
      { wch: 15 },  // Payment Status
      { wch: 15 },  // Total Amount
      { wch: 12 },  // Paid At
      { wch: 20 },  // Transaction ID
      { wch: 30 }   // Notes
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Pembayaran');

    // Generate buffer
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="laporan-pembayaran-${new Date().toISOString().split('T')[0]}.xlsx"`
      }
    });

  } catch (error) {
    console.error('Export payments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export payments data' },
      { status: 500 }
    );
  }
}
