import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Address from '@/models/Address';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const addresses = await Address.find({ userId: session.user.id }).sort({ isDefault: -1, createdAt: -1 });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    await connectDB();

    // Jika alamat baru di-set sebagai default, update alamat lain jadi non-default
    if (body.isDefault) {
      await Address.updateMany(
        { userId: session.user.id },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      ...body,
      userId: session.user.id
    });

    return NextResponse.json({ address });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
