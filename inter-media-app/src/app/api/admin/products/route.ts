import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { productSchema } from '@/lib/validations';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'kasir'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Try to get products with populated category
    let products;
    try {
      products = await Product.find()
        .populate('categoryId', 'name')
        .sort({ createdAt: -1 });
    } catch (populateError) {
      console.error('Populate error, trying without populate:', populateError);
      // Fallback: get products without populate
      products = await Product.find().sort({ createdAt: -1 });
    }
    
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    await connectDB();

    const slug = validatedData.name.toLowerCase().replace(/\s+/g, '-');
    
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json({ error: 'Produk sudah ada' }, { status: 400 });
    }

    const product = await Product.create({
      ...validatedData,
      slug,
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
