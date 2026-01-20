import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Get user details
    const userIds = chatUsers.map(chat => chat._id);
    const users = await User.find({ _id: { $in: userIds } }).select('name email');

    const chatRooms = chatUsers.map(chat => {
      const user = users.find(u => u._id.toString() === chat._id);
      return {
        userId: chat._id,
        userName: user?.name || user?.email || 'Unknown User',
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
        unreadCount: chat.unreadCount,
        isOnline: false // TODO: Implement real-time online status
      };
    });

    return NextResponse.json(chatRooms);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
