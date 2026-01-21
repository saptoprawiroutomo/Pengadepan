import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const cart = await Cart.findOne({ userId: session.user.id })
      .populate('items.productId', 'name slug price stock images');

    return NextResponse.json(cart || { items: [] });
  } catch (error: any) {
    console.error('Cart API Error:', error);
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, qty } = await request.json();

    await connectDB();

    // Check product availability
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return NextResponse.json({ error: 'Produk tidak tersedia' }, { status: 400 });
    }

    if (product.stock < qty) {
      return NextResponse.json({ error: 'Stok tidak mencukupi' }, { status: 400 });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId: session.user.id });
    
    if (!cart) {
      cart = new Cart({ userId: session.user.id, items: [] });
    }

    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      cart.items[existingItemIndex].qty += qty;
      cart.items[existingItemIndex].priceSnapshot = product.price;
    } else {
      // Add new item
      cart.items.push({
        productId,
        qty,
        priceSnapshot: product.price
      });
    }

    await cart.save();

    return NextResponse.json({ message: 'Item berhasil ditambahkan ke keranjang' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
