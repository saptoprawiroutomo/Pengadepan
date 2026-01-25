import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const mongoose = require('mongoose');
    const db = mongoose.connection.db;

    // Get products with category info
    const products = await db.collection('products').aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $addFields: {
          categoryName: { $arrayElemAt: ['$category.name', 0] },
          stockStatus: {
            $cond: {
              if: { $eq: ['$stock', 0] },
              then: 'Habis',
              else: {
                $cond: {
                  if: { $lte: ['$stock', 10] },
                  then: 'Menipis',
                  else: 'Tersedia'
                }
              }
            }
          }
        }
      },
      { $sort: { name: 1 } }
    ]).toArray();

    // Summary data
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const outOfStock = products.filter(p => (p.stock || 0) === 0).length;
    const lowStock = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= 10).length;

    const summaryData = [
      { 'Kategori': 'Total Produk', 'Jumlah': totalProducts },
      { 'Kategori': 'Total Stok', 'Jumlah': totalStock },
      { 'Kategori': 'Stok Habis', 'Jumlah': outOfStock },
      { 'Kategori': 'Stok Menipis', 'Jumlah': lowStock },
      { 'Kategori': 'Stok Tersedia', 'Jumlah': totalProducts - outOfStock - lowStock }
    ];

    // Product details
    const productData = products.map(product => ({
      'Nama Produk': product.name,
      'Kategori': product.categoryName || 'N/A',
      'Stok': product.stock || 0,
      'Harga': product.price || 0,
      'Berat (gram)': product.weight || 0,
      'Status Stok': product.stockStatus,
      'Status Produk': product.isActive ? 'Aktif' : 'Nonaktif',
      'Tanggal Dibuat': new Date(product.createdAt).toLocaleDateString('id-ID')
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 20 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan Stok');

    // Products sheet
    const productWs = XLSX.utils.json_to_sheet(productData);
    productWs['!cols'] = [
      { wch: 30 }, // Nama Produk
      { wch: 15 }, // Kategori
      { wch: 8 },  // Stok
      { wch: 12 }, // Harga
      { wch: 12 }, // Berat
      { wch: 12 }, // Status Stok
      { wch: 10 }, // Status Produk
      { wch: 15 }  // Tanggal
    ];
    XLSX.utils.book_append_sheet(wb, productWs, 'Detail Stok');

    // Out of stock products
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);
    if (outOfStockProducts.length > 0) {
      const outOfStockData = outOfStockProducts.map(product => ({
        'Nama Produk': product.name,
        'Kategori': product.categoryName || 'N/A',
        'Harga': product.price || 0,
        'Tanggal Dibuat': new Date(product.createdAt).toLocaleDateString('id-ID')
      }));
      const outOfStockWs = XLSX.utils.json_to_sheet(outOfStockData);
      outOfStockWs['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, outOfStockWs, 'Stok Habis');
    }

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const fileName = `laporan-stok-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });

  } catch (error: any) {
    console.error('Export stock error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
