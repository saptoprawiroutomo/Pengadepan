import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import SalesTransaction from '@/models/SalesTransaction';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    const userSession = await getServerSession(authOptions);
    if (!userSession || userSession.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const sales = await SalesTransaction.find()
      .populate('items.productId', 'name price')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ sales });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userSession = await getServerSession(authOptions);
    if (!userSession || userSession.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { items, paymentMethod, customerName, discount = 0 } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Items required' }, { status: 400 });
    }

    await connectDB();

    let total = 0;
    const saleItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 400 });
      }

      if (product.stock < item.qty) {
        return NextResponse.json({ error: `Insufficient stock for ${product.name}` }, { status: 400 });
      }

      const subtotal = product.price * item.qty;
      total += subtotal;

      saleItems.push({
        productId: product._id,
        nameSnapshot: product.name,
        priceSnapshot: product.price,
        qty: item.qty,
        subtotal
      });

      // Update stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.qty, soldCount: item.qty }
      });
    }

    const finalTotal = total - discount;

    const sale = await SalesTransaction.create({
      items: saleItems,
      subtotal: total,
      discount,
      total: finalTotal,
      paymentMethod,
      customerName: customerName || 'Walk-in Customer',
      cashierId: userSession.user.id,
      status: 'completed'
    });

    return NextResponse.json({ 
      message: 'Sale completed successfully',
      sale 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
