import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    await connectDB();
    
    const messages = await Chat.find({ userId })
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json(messages);
  } catch (error: any) {
    console.error('Admin chat history error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, message, senderName } = await request.json();

    if (!message?.trim() || !userId) {
      return NextResponse.json({ error: 'Message and userId are required' }, { status: 400 });
    }

    await connectDB();

    const newMessage = new Chat({
      userId,
      message: message.trim(),
      sender: 'admin',
      senderName: senderName || 'Admin',
      isRead: false
    });

    await newMessage.save();

    return NextResponse.json(newMessage);
  } catch (error: any) {
    console.error('Admin send message error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
