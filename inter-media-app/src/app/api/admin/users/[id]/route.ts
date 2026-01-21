import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    console.log('DELETE request params:', params);
    
    if (!params || !params.id) {
      console.log('No ID provided in params');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const userId = params.id;
    console.log('DELETE request for user ID:', userId);
    
    await connectDB();
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    console.log('PUT request params:', params);
    
    if (!params || !params.id) {
      console.log('No ID provided in params');
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }
    
    const userId = params.id;
    const body = await request.json();
    
    await connectDB();
    
    const { email, name, role, password, phone, address, isActive } = body;
    const updateData: any = { email, name, role, phone, address, isActive };
    
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }
    
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const responseData = user.toObject();
    delete responseData.passwordHash;
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
