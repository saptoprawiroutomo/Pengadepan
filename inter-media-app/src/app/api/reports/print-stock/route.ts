import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await connectDB();

    const products = await Product.find({}).populate('categoryId', 'name').sort({ name: 1 });

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
    const lowStock = products.filter(product => product.stock < 10).length;
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);

    const printHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Laporan Stok - Inter Medi-A</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; }
        .report-title { font-size: 18px; margin-top: 10px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 20px; font-weight: bold; color: #2563eb; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        .table th { background-color: #f5f5f5; font-weight: bold; }
        .low-stock { background-color: #fef2f2; color: #dc2626; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        @media print { body { margin: 0; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">INTER MEDI-A</div>
        <div>Printer • Fotocopy • Komputer</div>
        <div class="report-title">LAPORAN STOK PRODUK</div>
        <div>Per tanggal: ${new Date().toLocaleDateString('id-ID')}</div>
    </div>

    <div class="summary">
        <div class="summary-item">
            <div class="summary-value">${totalProducts}</div>
            <div>Total Produk</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${totalStock}</div>
            <div>Total Stok</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">${lowStock}</div>
            <div>Stok Menipis</div>
        </div>
        <div class="summary-item">
            <div class="summary-value">Rp ${totalValue.toLocaleString('id-ID')}</div>
            <div>Nilai Stok</div>
        </div>
    </div>

    <table class="table">
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>SKU</th>
                <th>Stok</th>
                <th>Harga</th>
                <th>Nilai Stok</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            ${products.map((product, index) => `
                <tr ${product.stock < 10 ? 'class="low-stock"' : ''}>
                    <td>${index + 1}</td>
                    <td>${product.name}</td>
                    <td>${product.categoryId?.name || 'N/A'}</td>
                    <td>${product.sku || 'N/A'}</td>
                    <td>${product.stock}</td>
                    <td>Rp ${product.price.toLocaleString('id-ID')}</td>
                    <td>Rp ${(product.price * product.stock).toLocaleString('id-ID')}</td>
                    <td>${product.isActive ? 'Aktif' : 'Nonaktif'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada: ${new Date().toLocaleString('id-ID')}</p>
        <p>Inter Medi-A - Laporan Stok Produk</p>
        <p style="color: #dc2626;">* Produk dengan stok < 10 ditandai dengan warna merah</p>
    </div>

    <script>
        window.onload = function() {
            window.print();
        }
    </script>
</body>
</html>`;

    return new NextResponse(printHTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
