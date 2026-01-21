import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import SalesTransaction from '@/models/SalesTransaction';
import Product from '@/models/Product';
import { generateCode, getNextSequence } from '@/lib/utils-server';

export async function POST(request: NextRequest) {
  try {
    const userSession = await getServerSession(authOptions);
    if (!userSession || !['admin', 'kasir'].includes(userSession.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items, customerName } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Items tidak boleh kosong' }, { status: 400 });
    }

    await connectDB();

    // Validate and prepare transaction items
    const transactionItems = [];
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        throw new Error(`Produk tidak ditemukan atau tidak aktif`);
      }

      if (product.stock < item.qty) {
        throw new Error(`Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}`);
      }

      // Update stock
      const updateResult = await Product.updateOne(
        { 
          _id: product._id, 
          stock: { $gte: item.qty } 
        },
        { 
          $inc: { 
            stock: -item.qty,
            soldCount: item.qty
          }
        }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error(`Gagal mengupdate stok ${product.name}`);
      }

      const subtotal = product.price * item.qty;
      total += subtotal;

      transactionItems.push({
        productId: product._id,
        nameSnapshot: product.name,
        priceSnapshot: product.price,
        qty: item.qty,
        subtotal
      });
    }

    // Generate transaction code
    const year = new Date().getFullYear();
    const sequence = await getNextSequence('TXN', year);
    const transactionCode = generateCode('TXN', year, sequence);
    const receiptNumber = `POS-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create sales transaction
    const transaction = await SalesTransaction.create({
      transactionCode,
      receiptNumber,
      cashierId: userSession.user.id,
      customerName: customerName || 'Walk-in Customer',
      items: transactionItems,
      total
    });

    return NextResponse.json({
      message: 'Transaksi berhasil disimpan',
      transaction: transaction
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
