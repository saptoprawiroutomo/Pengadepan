import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import * as XLSX from 'xlsx';

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

    // Get services with user info
    const services = await db.collection('servicerequests').aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $addFields: {
          customerName: { $arrayElemAt: ['$user.name', 0] },
          customerEmail: { $arrayElemAt: ['$user.email', 0] }
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    // Calculate summary
    const totalServices = services.length;
    const totalRevenue = services.reduce((sum, service) => sum + (service.totalCost || 0), 0);
    const avgCost = totalServices > 0 ? totalRevenue / totalServices : 0;

    // Group by status
    const statusGroups = services.reduce((acc, service) => {
      const status = service.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Group by device type
    const deviceGroups = services.reduce((acc, service) => {
      const device = service.deviceType || 'unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    // Summary data
    const summaryData = [
      { 'Kategori': 'Total Servis', 'Jumlah': totalServices, 'Nilai': totalRevenue },
      { 'Kategori': 'Rata-rata Biaya', 'Jumlah': '-', 'Nilai': Math.round(avgCost) },
      ...Object.entries(statusGroups).map(([status, count]) => ({
        'Kategori': `Status: ${status}`,
        'Jumlah': count,
        'Nilai': '-'
      })),
      ...Object.entries(deviceGroups).map(([device, count]) => ({
        'Kategori': `Device: ${device}`,
        'Jumlah': count,
        'Nilai': '-'
      }))
    ];

    // Service details
    const serviceData = services.map(service => ({
      'Service Code': service.serviceCode || `SRV-${service._id?.toString().slice(-6)}`,
      'Tanggal': new Date(service.createdAt).toLocaleDateString('id-ID'),
      'Customer': service.customerName || 'N/A',
      'Email': service.customerEmail || 'N/A',
      'Telepon': service.phone || 'N/A',
      'Jenis Perangkat': service.deviceType || 'N/A',
      'Keluhan': service.complaint || 'N/A',
      'Status': service.status || 'pending',
      'Biaya Jasa': service.laborCost || 0,
      'Biaya Sparepart': service.partsCost || 0,
      'Total Biaya': service.totalCost || 0,
      'Alamat': service.address || 'N/A',
      'Tanggal Selesai': service.completedAt ? new Date(service.completedAt).toLocaleDateString('id-ID') : '-'
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan Servis');

    // Services sheet
    const serviceWs = XLSX.utils.json_to_sheet(serviceData);
    serviceWs['!cols'] = [
      { wch: 15 }, // Service Code
      { wch: 12 }, // Tanggal
      { wch: 20 }, // Customer
      { wch: 25 }, // Email
      { wch: 15 }, // Telepon
      { wch: 15 }, // Jenis Perangkat
      { wch: 30 }, // Keluhan
      { wch: 12 }, // Status
      { wch: 12 }, // Biaya Jasa
      { wch: 15 }, // Biaya Sparepart
      { wch: 12 }, // Total Biaya
      { wch: 30 }, // Alamat
      { wch: 15 }  // Tanggal Selesai
    ];
    XLSX.utils.book_append_sheet(wb, serviceWs, 'Detail Servis');

    // Completed services
    const completedServices = services.filter(s => s.status === 'completed');
    if (completedServices.length > 0) {
      const completedData = completedServices.map(service => ({
        'Service Code': service.serviceCode || `SRV-${service._id?.toString().slice(-6)}`,
        'Customer': service.customerName || 'N/A',
        'Device': service.deviceType || 'N/A',
        'Total Biaya': service.totalCost || 0,
        'Tanggal Mulai': new Date(service.createdAt).toLocaleDateString('id-ID'),
        'Tanggal Selesai': service.completedAt ? new Date(service.completedAt).toLocaleDateString('id-ID') : '-'
      }));
      const completedWs = XLSX.utils.json_to_sheet(completedData);
      completedWs['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, completedWs, 'Servis Selesai');
    }

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const fileName = `laporan-servis-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });

  } catch (error: any) {
    console.error('Export services error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
