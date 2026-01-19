import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';
import { serviceRequestSchema } from '@/lib/validations';
import { generateCode, getNextSequence } from '@/lib/utils-server';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    let services;
    if (['admin', 'kasir'].includes(session.user.role)) {
      // Admin/kasir can see all services
      services = await ServiceRequest.find()
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });
    } else {
      // Customer can only see their own services
      services = await ServiceRequest.find({ userId: session.user.id })
        .sort({ createdAt: -1 });
    }

    return NextResponse.json(services);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = serviceRequestSchema.parse(body);

    await connectDB();

    // Generate service code
    const year = new Date().getFullYear();
    const sequence = await getNextSequence('SRV', year);
    const serviceCode = generateCode('SRV', year, sequence);

    const serviceRequest = await ServiceRequest.create({
      serviceCode,
      userId: session.user.id,
      ...validatedData,
      status: 'received'
    });

    return NextResponse.json({
      message: 'Request servis berhasil dibuat',
      service: serviceRequest
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
