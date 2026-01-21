import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Category from '@/models/Category';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Temporarily disable auth for testing
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const { name, description } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    await connectDB();
    
    // Check if category with same name exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }
    
    const category = await Category.create({ 
      name, 
      slug,
      description: description || ''
    });
    
    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
