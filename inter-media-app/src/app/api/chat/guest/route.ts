import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';

    await connectDB();
    
    const messages = await Chat.find({ userId })
      .sort({ createdAt: 1 })
      .limit(50);

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, message, senderName } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    await connectDB();

    const newMessage = new Chat({
      userId: userId || 'guest',
      message: message.trim(),
      sender: 'user',
      senderName: senderName || 'Guest User',
      isRead: false
    });

    await newMessage.save();

    return NextResponse.json(newMessage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
