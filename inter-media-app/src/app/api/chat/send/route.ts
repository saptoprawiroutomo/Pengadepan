import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, message, senderName } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    await connectDB();

    const chatMessage = await Chat.create({
      userId: userId || session.user.id,
      message: message.trim(),
      sender: session.user.role === 'admin' ? 'admin' : 'user',
      senderName: senderName || session.user.name || 'User',
      isPromo: false
    });

    return NextResponse.json({
      message: 'Message sent successfully',
      chat: chatMessage
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
