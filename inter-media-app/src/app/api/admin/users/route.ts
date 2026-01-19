import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/utils-server';
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['admin', 'kasir', 'customer']),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error: any) {
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
    const validatedData = userSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 });
    }

    const passwordHash = await hashPassword(validatedData.password!);

    const user = await User.create({
      ...validatedData,
      passwordHash,
    });

    const { passwordHash: _, ...userResponse } = user.toObject();
    return NextResponse.json(userResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
