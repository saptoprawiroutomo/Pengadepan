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

    const dateFilter: any = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const matchStage = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {};

    // Aggregate top products from orders
    const topProducts = await Order.aggregate([
      { 
        $match: { 
          ...matchStage,
          status: { $in: ['paid', 'processed', 'shipped', 'done'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.nameSnapshot' },
          totalSold: { $sum: '$items.qty' },
          totalRevenue: { $sum: '$items.subtotal' },
          avgPrice: { $avg: '$items.priceSnapshot' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 50 }
    ]);

    const excelData = topProducts.map((product, index) => ({
      'Ranking': index + 1,
      'Nama Produk': product.productName,
      'Total Terjual': product.totalSold,
      'Jumlah Order': product.orderCount,
      'Total Revenue': product.totalRevenue,
      'Harga Rata-rata': Math.round(product.avgPrice),
      'Revenue per Unit': Math.round(product.totalRevenue / product.totalSold)
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    ws['!cols'] = [
      { wch: 8 },  // Ranking
      { wch: 30 }, // Nama Produk
      { wch: 12 }, // Total Terjual
      { wch: 12 }, // Jumlah Order
      { wch: 15 }, // Total Revenue
      { wch: 15 }, // Harga Rata-rata
      { wch: 15 }  // Revenue per Unit
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Produk Terlaris');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const fileName = `laporan-produk-terlaris-${new Date().toISOString().split('T')[0]}.xlsx`;
    
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
