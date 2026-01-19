import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/utils-server';

export async function POST() {
  try {
    await connectDB();
    
    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@test.com' });
    
    // Create new admin with simple password
    const hashedPassword = await hashPassword('123456');
    
    const admin = await User.create({
      name: 'Admin Test',
      email: 'admin@test.com',
      passwordHash: hashedPassword,
      role: 'admin',
      phone: '081234567890',
      address: 'Test Address',
      isActive: true
    });
    
    return NextResponse.json({ 
      message: 'Admin created successfully',
      email: 'admin@test.com',
      password: '123456',
      id: admin._id
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
