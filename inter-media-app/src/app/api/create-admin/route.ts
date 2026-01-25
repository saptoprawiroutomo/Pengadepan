import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/utils-server';

export async function POST() {
  try {
    await connectDB();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@intermedia.com' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin already exists' });
    }

    // Create admin user
    const hashedPassword = await hashPassword('admin123');
    
    const adminUser = new User({
      name: 'Admin',
      email: 'admin@intermedia.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();

    return NextResponse.json({ 
      message: 'Admin user created successfully',
      email: 'admin@intermedia.com',
      password: 'admin123'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
