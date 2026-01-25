import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';

export async function GET() {
  try {
    await connectDB();
    const count = await Chat.countDocuments();
    return NextResponse.json({ 
      status: 'Connected', 
      chatCount: count,
      message: 'Database connection successful' 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'Error', 
      error: error.message 
    }, { status: 500 });
  }
}
