import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { generateCode, getNextSequence } from '@/lib/utils-server';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  
  try {
    const userSession = await getServerSession();
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shippingAddress, paymentMethod } = await request.json();

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Alamat pengiriman wajib diisi' }, { status: 400 });
    }

    await connectDB();
    
    session.startTransaction();

    // Get cart
    const cart = await Cart.findOne({ userId: userSession.user.id }).session(session);
    if (!cart || cart.items.length === 0) {
      throw new Error('Keranjang kosong');
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let total = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId).session(session);
      
      if (!product || !product.isActive) {
        throw new Error(`Produk ${product?.name || 'tidak ditemukan'} tidak tersedia`);
      }

      if (product.stock < cartItem.qty) {
        throw new Error(`Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}`);
      }

      // Update stock atomically
      const updateResult = await Product.updateOne(
        { 
          _id: product._id, 
          stock: { $gte: cartItem.qty } 
        },
        { 
          $inc: { 
            stock: -cartItem.qty,
            soldCount: cartItem.qty
          }
        }
      ).session(session);

      if (updateResult.modifiedCount === 0) {
        throw new Error(`Gagal mengupdate stok ${product.name}`);
      }

      const subtotal = cartItem.priceSnapshot * cartItem.qty;
      total += subtotal;

      orderItems.push({
        productId: product._id,
        nameSnapshot: product.name,
        priceSnapshot: cartItem.priceSnapshot,
        qty: cartItem.qty,
        subtotal
      });
    }

    // Generate order code
    const year = new Date().getFullYear();
    const sequence = await getNextSequence('ORD', year);
    const orderCode = generateCode('ORD', year, sequence);

    // Create order
    const order = await Order.create([{
      orderCode,
      userId: userSession.user.id,
      items: orderItems,
      total,
      shippingAddress,
      paymentMethod: paymentMethod || 'transfer',
      status: 'pending'
    }], { session });

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: userSession.user.id },
      { items: [] }
    ).session(session);

    await session.commitTransaction();

    return NextResponse.json({
      message: 'Pesanan berhasil dibuat',
      order: order[0]
    });

  } catch (error: any) {
    await session.abortTransaction();
    return NextResponse.json({ error: error.message }, { status: 400 });
  } finally {
    session.endSession();
  }
}
