import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    // Extract slug from URL
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const slug = pathSegments[pathSegments.length - 1];
    
    if (!slug) {
      return NextResponse.json({ error: 'Product slug is required' }, { status: 400 });
    }

    await connectDB();
    
    const product = await Product.findOne({ slug, isActive: true })
      .populate('categoryId', 'name');
    
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Product detail API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
