import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { ChatRoom, ChatMessage } from '@/models/Chat';

export async function GET(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Verify user has access to this room
    const room = await ChatRoom.findById(params.roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!['admin', 'kasir'].includes(session.user.role) && room.customerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await ChatMessage.find({ roomId: params.roomId })
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 })
      .limit(100);

    return NextResponse.json(messages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { roomId: string } }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    await connectDB();

    // Verify user has access to this room
    const room = await ChatRoom.findById(params.roomId);
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!['admin', 'kasir'].includes(session.user.role) && room.customerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create message
    const chatMessage = await ChatMessage.create({
      roomId: params.roomId,
      senderId: session.user.id,
      message: message.trim(),
      readBy: [session.user.id]
    });

    // Update room last message time
    await ChatRoom.findByIdAndUpdate(params.roomId, {
      lastMessageAt: new Date()
    });

    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate('senderId', 'name role');

    return NextResponse.json(populatedMessage);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
