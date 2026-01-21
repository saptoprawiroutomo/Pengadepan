import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Temporarily disable auth for testing
    // const session = await getServerSession(authOptions);
    
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const params = await context.params;
    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    await connectDB();

    const serviceRequest = await ServiceRequest.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Service request not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Status updated successfully',
      serviceRequest 
    });
  } catch (error: any) {
    console.error('Update service request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
