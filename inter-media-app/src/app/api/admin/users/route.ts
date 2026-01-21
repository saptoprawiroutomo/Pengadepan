import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name, role, password, phone, address, isActive } = await request.json();

    if (!email || !name || !role || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();
    
    const passwordHash = await bcrypt.hash(password, 12);
    
    const user = await User.create({ 
      email, 
      name, 
      role, 
      passwordHash,
      phone: phone || undefined,
      address: address || undefined,
      isActive: isActive !== false
    });
    
    const responseData = user.toObject();
    delete responseData.passwordHash;
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
