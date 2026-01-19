import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/utils-server';
import { z } from 'zod';

const userUpdateSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  role: z.enum(['admin', 'kasir', 'customer']),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = userUpdateSchema.parse(body);

    await connectDB();

    const updateData: any = { ...validatedData };
    
    if (validatedData.password) {
      updateData.passwordHash = await hashPassword(validatedData.password);
      delete updateData.password;
    }

    const user = await User.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).select('-passwordHash');

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findByIdAndDelete(params.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
