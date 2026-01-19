import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Categories API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = categorySchema.parse(body);

    await connectDB();

    const slug = validatedData.name.toLowerCase().replace(/\s+/g, '-');
    
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json({ error: 'Kategori sudah ada' }, { status: 400 });
    }

    const category = await Category.create({
      name: validatedData.name,
      slug,
    });

    return NextResponse.json(category);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
