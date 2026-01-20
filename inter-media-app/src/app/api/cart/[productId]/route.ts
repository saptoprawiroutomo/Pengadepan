import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Cart from '@/models/Cart';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { qty } = await request.json();

    await connectDB();

    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      return NextResponse.json({ error: 'Keranjang tidak ditemukan' }, { status: 404 });
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
    }

    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].qty = qty;
    }

    await cart.save();

    return NextResponse.json({ message: 'Keranjang berhasil diupdate' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const cart = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      return NextResponse.json({ error: 'Keranjang tidak ditemukan' }, { status: 404 });
    }

    cart.items = cart.items.filter(
      (item: any) => item.productId.toString() !== productId
    );

    await cart.save();

    return NextResponse.json({ message: 'Item berhasil dihapus dari keranjang' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
