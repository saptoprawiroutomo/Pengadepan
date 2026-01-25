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

    // Get top products from both POS and Online transactions
    const posProducts = await db.collection('salestransactions').aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.nameSnapshot',
          productName: { $first: '$items.nameSnapshot' },
          totalSold: { $sum: '$items.qty' },
          totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } },
          avgPrice: { $avg: '$items.price' },
          orderCount: { $sum: 1 },
          source: { $first: 'POS' }
        }
      }
    ]).toArray();

    const onlineProducts = await db.collection('orders').aggregate([
      ...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.nameSnapshot',
          productName: { $first: '$items.nameSnapshot' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          avgPrice: { $avg: '$items.price' },
          orderCount: { $sum: 1 },
          source: { $first: 'Online' }
        }
      }
    ]).toArray();

    // Combine and aggregate products from both sources
    const productMap = new Map();
    
    [...posProducts, ...onlineProducts].forEach(product => {
      const key = product.productName;
      if (productMap.has(key)) {
        const existing = productMap.get(key);
        existing.totalSold += product.totalSold;
        existing.totalRevenue += product.totalRevenue;
        existing.orderCount += product.orderCount;
        existing.sources.push(product.source);
      } else {
        productMap.set(key, {
          ...product,
          sources: [product.source]
        });
      }
    });

    // Convert to array and sort
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 50);

    // Calculate summary
    const totalProductsSold = topProducts.reduce((sum, p) => sum + p.totalSold, 0);
    const totalRevenue = topProducts.reduce((sum, p) => sum + p.totalRevenue, 0);
    const productsWithSales = topProducts.length;

    const summaryData = [
      { 'Kategori': 'Total Produk Terjual', 'Jumlah': totalProductsSold, 'Nilai': '-' },
      { 'Kategori': 'Total Revenue', 'Jumlah': '-', 'Nilai': totalRevenue },
      { 'Kategori': 'Produk dengan Penjualan', 'Jumlah': productsWithSales, 'Nilai': '-' },
      { 'Kategori': 'Rata-rata per Produk', 'Jumlah': Math.round(totalProductsSold / productsWithSales), 'Nilai': Math.round(totalRevenue / productsWithSales) }
    ];

    // Product details
    const productData = topProducts.map((product, index) => ({
      'Ranking': index + 1,
      'Nama Produk': product.productName || 'N/A',
      'Total Terjual': product.totalSold,
      'Jumlah Order': product.orderCount,
      'Total Revenue': product.totalRevenue,
      'Harga Rata-rata': Math.round(product.avgPrice || 0),
      'Revenue per Unit': Math.round(product.totalRevenue / product.totalSold),
      'Sumber': product.sources.join(', ')
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, 'Ringkasan');

    // Top products sheet
    const productWs = XLSX.utils.json_to_sheet(productData);
    productWs['!cols'] = [
      { wch: 8 },  // Ranking
      { wch: 30 }, // Nama Produk
      { wch: 12 }, // Total Terjual
      { wch: 12 }, // Jumlah Order
      { wch: 15 }, // Total Revenue
      { wch: 15 }, // Harga Rata-rata
      { wch: 15 }, // Revenue per Unit
      { wch: 12 }  // Sumber
    ];
    XLSX.utils.book_append_sheet(wb, productWs, 'Produk Terlaris');

    // Top 10 only
    const top10Data = productData.slice(0, 10);
    const top10Ws = XLSX.utils.json_to_sheet(top10Data);
    top10Ws['!cols'] = productWs['!cols'];
    XLSX.utils.book_append_sheet(wb, top10Ws, 'Top 10');

    // POS vs Online breakdown
    const posOnlyProducts = topProducts.filter(p => p.sources.includes('POS') && !p.sources.includes('Online'));
    const onlineOnlyProducts = topProducts.filter(p => p.sources.includes('Online') && !p.sources.includes('POS'));
    const bothChannelProducts = topProducts.filter(p => p.sources.includes('POS') && p.sources.includes('Online'));

    const channelData = [
      { 'Channel': 'POS Only', 'Jumlah Produk': posOnlyProducts.length, 'Total Terjual': posOnlyProducts.reduce((sum, p) => sum + p.totalSold, 0) },
      { 'Channel': 'Online Only', 'Jumlah Produk': onlineOnlyProducts.length, 'Total Terjual': onlineOnlyProducts.reduce((sum, p) => sum + p.totalSold, 0) },
      { 'Channel': 'Both Channels', 'Jumlah Produk': bothChannelProducts.length, 'Total Terjual': bothChannelProducts.reduce((sum, p) => sum + p.totalSold, 0) }
    ];

    const channelWs = XLSX.utils.json_to_sheet(channelData);
    channelWs['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, channelWs, 'Channel Analysis');

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    const fileName = `laporan-produk-terlaris-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    });

  } catch (error: any) {
    console.error('Export top products error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
