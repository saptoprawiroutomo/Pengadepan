import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, senderName, isPromo } = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    await connectDB();

    // Get all customers
    const customers = await User.find({ role: 'customer' }, { _id: 1 });

    // Send message to all customers
    const broadcastMessages = customers.map(customer => ({
      userId: customer._id.toString(),
      message: message.trim(),
      sender: 'admin',
      senderName: senderName || 'Admin',
      isPromo: isPromo || false,
      createdAt: new Date()
    }));

    await Chat.insertMany(broadcastMessages);

    return NextResponse.json({
      message: 'Broadcast sent successfully',
      recipientCount: customers.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
