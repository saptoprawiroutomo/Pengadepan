import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';
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

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const matchStage = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    const services = await ServiceRequest.find(matchStage)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    const excelData = services.map(service => ({
      'Service Code': service.serviceCode,
      'Tanggal': new Date(service.createdAt).toLocaleDateString('id-ID'),
      'Customer': service.userId?.name || 'N/A',
      'Email': service.userId?.email || 'N/A',
      'Jenis Perangkat': service.deviceType,
      'Keluhan': service.complaint,
      'Status': service.status,
      'Biaya Jasa': service.laborCost || 0,
      'Biaya Sparepart': service.partsCost || 0,
      'Total Biaya': service.totalCost || 0,
      'Telepon': service.phone,
      'Alamat': service.address
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    ws['!cols'] = [
      { wch: 15 }, // Service Code
      { wch: 12 }, // Tanggal
      { wch: 20 }, // Customer
      { wch: 25 }, // Email
      { wch: 15 }, // Jenis Perangkat
      { wch: 30 }, // Keluhan
      { wch: 12 }, // Status
      { wch: 12 }, // Biaya Jasa
      { wch: 15 }, // Biaya Sparepart
      { wch: 12 }, // Total Biaya
      { wch: 15 }, // Telepon
      { wch: 30 }  // Alamat
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Servis');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const fileName = `laporan-servis-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
