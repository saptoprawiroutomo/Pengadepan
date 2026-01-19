import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    
    const productCount = await Product.countDocuments();
    const categoryCount = await Category.countDocuments();
    
    const products = await Product.find().limit(5);
    
    return NextResponse.json({ 
      productCount, 
      categoryCount,
      sampleProducts: products 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
