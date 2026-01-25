import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { generateCode, getNextSequence } from '@/lib/utils-server';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const userSession = await getServerSession(authOptions);
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const orders = await Order.find({ userId: userSession.user.id })
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Creating order...');
    
    const userSession = await getServerSession(authOptions);
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { shippingAddress, paymentMethod } = body;

    if (!shippingAddress) {
      return NextResponse.json({ error: 'Alamat pengiriman wajib diisi' }, { status: 400 });
    }

    await connectDB();

    // Get cart
    const cart = await Cart.findOne({ userId: userSession.user.id });
    if (!cart || cart.items.length === 0) {
      throw new Error('Keranjang kosong');
    }

    // Validate stock and prepare order items
    const orderItems = [];
    let total = 0;

    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      
      if (!product || !product.isActive) {
        throw new Error(`Produk ${product?.name || 'tidak ditemukan'} tidak tersedia`);
      }

      if (product.stock < cartItem.qty) {
        throw new Error(`Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}`);
      }

      // Update stock
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
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error(`Gagal mengupdate stok ${product.name}`);
      }

      const subtotal = cartItem.priceSnapshot * cartItem.qty;
      total += subtotal;

      orderItems.push({
        productId: product._id,
        nameSnapshot: product.name,
        priceSnapshot: cartItem.priceSnapshot,
        weightSnapshot: product.weight || 1000, // Default 1000g jika tidak ada weight
        qty: cartItem.qty,
        subtotal
      });
    }

    // Generate order code
    const year = new Date().getFullYear();
    const sequence = await getNextSequence('ORD', year);
    const orderCode = generateCode('ORD', year, sequence);

    // Create order
    const order = await Order.create({
      orderCode,
      userId: userSession.user.id,
      items: orderItems,
      subtotal: total,
      shippingCost: body.shippingCost || 0,
      total: total + (body.shippingCost || 0),
      shippingAddress,
      shippingCourier: body.shippingCourier,
      shippingService: body.shippingService,
      shippingEstimate: body.shippingEstimate,
      paymentMethod: paymentMethod || 'transfer',
      status: 'pending'
    });

    // Clear cart
    await Cart.findOneAndUpdate(
      { userId: userSession.user.id },
      { items: [] }
    );

    return NextResponse.json({
      message: 'Pesanan berhasil dibuat',
      order: order
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
