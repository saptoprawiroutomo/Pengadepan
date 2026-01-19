import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { hashPassword } from '@/lib/utils-server';
import { registerSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ email: validatedData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      phone: validatedData.phone,
      address: validatedData.address,
      role: 'customer',
    });

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registrasi gagal' },
      { status: 400 }
    );
  }
}
