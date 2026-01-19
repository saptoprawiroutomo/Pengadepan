import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    await connectDB();

    const query: any = { isActive: true };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      }
    }

    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Products API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
