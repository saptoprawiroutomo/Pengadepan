import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import * as XLSX from 'xlsx';

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

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const matchStage = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Get orders data
    const orders = await Order.find({
      ...matchStage,
      status: { $in: ['paid', 'processed', 'shipped', 'done'] }
    }).populate('userId', 'name email').sort({ createdAt: -1 });

    // Prepare Excel data
    const excelData = orders.map(order => ({
      'Kode Order': order.orderCode,
      'Tanggal': new Date(order.createdAt).toLocaleDateString('id-ID'),
      'Customer': order.userId?.name || 'N/A',
      'Email': order.userId?.email || 'N/A',
      'Subtotal': order.subtotal,
      'Ongkir': order.shippingCost,
      'Total': order.total,
      'Payment': order.paymentMethod === 'transfer' ? 'Transfer' : 'COD',
      'Status': order.status,
      'Alamat': order.shippingAddress
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Auto-width columns
    const colWidths = [
      { wch: 15 }, // Kode Order
      { wch: 12 }, // Tanggal
      { wch: 20 }, // Customer
      { wch: 25 }, // Email
      { wch: 12 }, // Subtotal
      { wch: 10 }, // Ongkir
      { wch: 12 }, // Total
      { wch: 10 }, // Payment
      { wch: 10 }, // Status
      { wch: 30 }  // Alamat
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Penjualan');

    // Generate Excel buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    // Return Excel file
    const fileName = `laporan-penjualan-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });

  } catch (error: any) {
    console.error('Export Excel error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
