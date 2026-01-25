import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';

export async function GET() {
  try {
    await connectDB();

    // Get all users who have sent messages
    const chatUsers = await Chat.aggregate([
      {
        $group: {
          _id: '$userId',
          lastMessage: { $last: '$message' },
          lastMessageTime: { $last: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$sender', 'user'] }, { $eq: ['$isRead', false] }] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ]);

    // For guest users, create simple entries
    const chatRooms = chatUsers.map(chat => {
      const isGuest = chat._id.startsWith('guest');
      return {
        userId: chat._id,
        userName: isGuest ? 'Guest User' : 'Unknown User',
        userEmail: isGuest ? 'guest@example.com' : 'No email',
        lastMessage: chat.lastMessage,
        lastActivity: chat.lastMessageTime,
        unreadCount: chat.unreadCount
      };
    });

    return NextResponse.json(chatRooms);
  } catch (error: any) {
    console.error('Admin chat rooms error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
