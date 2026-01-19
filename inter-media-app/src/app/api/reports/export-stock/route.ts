import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const products = await Product.find({}).populate('categoryId', 'name').sort({ name: 1 });

    const excelData = products.map(product => ({
      'Nama Produk': product.name,
      'Kategori': product.categoryId?.name || 'N/A',
      'SKU': product.sku || 'N/A',
      'Stok': product.stock,
      'Harga': product.price,
      'Berat (gram)': product.weight,
      'Status': product.isActive ? 'Aktif' : 'Nonaktif',
      'Tanggal Dibuat': new Date(product.createdAt).toLocaleDateString('id-ID')
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    ws['!cols'] = [
      { wch: 30 }, // Nama Produk
      { wch: 15 }, // Kategori
      { wch: 15 }, // SKU
      { wch: 8 },  // Stok
      { wch: 12 }, // Harga
      { wch: 12 }, // Berat
      { wch: 10 }, // Status
      { wch: 15 }  // Tanggal
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Stok');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const fileName = `laporan-stok-${new Date().toISOString().split('T')[0]}.xlsx`;
    
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
