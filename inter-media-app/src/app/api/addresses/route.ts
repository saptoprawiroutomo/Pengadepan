import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user address as default address
    const addresses = user.address ? [{
      _id: 'default',
      label: 'Alamat Utama',
      recipientName: user.name,
      phone: user.phone || '',
      address: user.address,
      isDefault: true
    }] : [];

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error('Addresses API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { address } = await request.json();
    
    await connectDB();
    
    // Update user address
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { address },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Address updated successfully',
      address: {
        _id: 'default',
        label: 'Alamat Utama',
        recipientName: user.name,
        phone: user.phone || '',
        address: user.address,
        isDefault: true
      }
    });
  } catch (error: any) {
    console.error('Update address error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
