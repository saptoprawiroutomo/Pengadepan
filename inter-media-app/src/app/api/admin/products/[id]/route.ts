import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { productSchema } from '@/lib/validations';

export async function PUT(request: NextRequest) {
  try {
    // Extract ID from URL manually
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    console.log('PUT request URL:', url.pathname);
    console.log('Extracted ID:', id);
    
    if (!id || id === 'route.ts') {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email, session?.user?.role);
    
    if (!session || session.user.role !== 'admin') {
      console.log('Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const validatedData = productSchema.parse(body);

    await connectDB();

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    const slug = validatedData.name.toLowerCase().replace(/\s+/g, '-');
    
    const product = await Product.findByIdAndUpdate(
      id,
      { ...validatedData, slug },
      { new: true }
    );

    console.log('Updated product:', product);

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error: any) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Extract ID from URL manually
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.length - 1];
    
    if (!id || id === 'route.ts') {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Produk berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
