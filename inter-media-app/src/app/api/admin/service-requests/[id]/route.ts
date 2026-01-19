import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    await connectDB();

    const serviceRequest = await ServiceRequest.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    return NextResponse.json({ serviceRequest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
