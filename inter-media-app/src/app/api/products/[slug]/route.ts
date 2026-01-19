import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectDB();
    
    const product = await Product.findOne({ 
      slug: params.slug, 
      isActive: true 
    }).populate('categoryId', 'name slug');

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
