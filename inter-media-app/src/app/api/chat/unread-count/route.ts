import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Count unread messages from admin to this user
    const count = await Chat.countDocuments({
      userId,
      sender: 'admin',
      isRead: false
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return NextResponse.json({ error: 'Failed to get unread count' }, { status: 500 });
  }
}
