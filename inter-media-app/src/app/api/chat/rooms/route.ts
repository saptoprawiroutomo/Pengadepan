import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import { ChatRoom, ChatMessage } from '@/models/Chat';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let rooms;
    if (['admin', 'kasir'].includes(session.user.role)) {
      // Admin can see all chat rooms
      rooms = await ChatRoom.find()
        .populate('customerId', 'name email')
        .populate('adminId', 'name')
        .sort({ lastMessageAt: -1 });
    } else {
      // Customer can only see their own room
      rooms = await ChatRoom.find({ customerId: session.user.id })
        .populate('adminId', 'name')
        .sort({ lastMessageAt: -1 });
    }

    return NextResponse.json(rooms);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Find or create chat room for customer
    let room = await ChatRoom.findOne({ customerId: session.user.id });
    
    if (!room) {
      room = await ChatRoom.create({
        customerId: session.user.id,
        lastMessageAt: new Date()
      });
    }

    return NextResponse.json(room);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
