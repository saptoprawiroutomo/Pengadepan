import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import SalesTransaction from '@/models/SalesTransaction';
import Product from '@/models/Product';
import { generateCode, getNextSequence } from '@/lib/utils-server';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  
  try {
    const userSession = await getServerSession();
    if (!userSession || !['admin', 'kasir'].includes(userSession.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { items } = await request.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Items tidak boleh kosong' }, { status: 400 });
    }

    await connectDB();
    session.startTransaction();

    // Validate and prepare transaction items
    const transactionItems = [];
    let total = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product || !product.isActive) {
        throw new Error(`Produk tidak ditemukan atau tidak aktif`);
      }

      if (product.stock < item.qty) {
        throw new Error(`Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}`);
      }

      // Update stock atomically
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
      ).session(session);

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

    // Create sales transaction
    const transaction = await SalesTransaction.create([{
      transactionCode,
      cashierId: userSession.user.id,
      items: transactionItems,
      total
    }], { session });

    await session.commitTransaction();

    return NextResponse.json({
      message: 'Transaksi berhasil disimpan',
      transaction: transaction[0]
    });

  } catch (error: any) {
    await session.abortTransaction();
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    session.endSession();
  }
}
