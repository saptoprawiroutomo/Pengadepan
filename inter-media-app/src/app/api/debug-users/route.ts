import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}).select('email role isActive');
    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
