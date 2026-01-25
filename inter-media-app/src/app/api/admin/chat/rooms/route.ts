import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Chat from '@/models/Chat';
import User from '@/models/User';
import mongoose from 'mongoose';

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

    // Get user details for each chat
    const chatRooms = await Promise.all(
      chatUsers.map(async (chat) => {
        const isGuest = chat._id.startsWith('guest');
        
        if (isGuest) {
          return {
            userId: chat._id,
            userName: 'Guest User',
            userEmail: 'guest@example.com',
            lastMessage: chat.lastMessage,
            lastActivity: chat.lastMessageTime,
            unreadCount: chat.unreadCount
          };
        }

        // Try to get user details from User model
        let user = null;
        if (mongoose.Types.ObjectId.isValid(chat._id)) {
          user = await User.findById(chat._id).select('name email');
        }
        
        return {
          userId: chat._id,
          userName: user?.name || 'Unknown User',
          userEmail: user?.email || 'No email',
          lastMessage: chat.lastMessage,
          lastActivity: chat.lastMessageTime,
          unreadCount: chat.unreadCount
        };
      })
    );

    return NextResponse.json(chatRooms);
  } catch (error: any) {
    console.error('Admin chat rooms error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
