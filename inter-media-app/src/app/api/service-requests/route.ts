import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'kasir'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const requests = await ServiceRequest.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Fetch service requests error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { deviceType, complaint, customerName, phone, address, preferredTime } = body;

    if (!deviceType || !complaint || !phone || !address) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    await connectDB();

    // Generate service code
    const serviceCode = 'SRV-' + Date.now();

    const serviceRequest = await ServiceRequest.create({
      serviceCode,
      userId: session?.user?.id || null, // Optional jika user belum login
      deviceType,
      complaint,
      address,
      phone,
      status: 'received'
    });

    return NextResponse.json({ 
      message: 'Service request berhasil dikirim',
      serviceRequest: {
        serviceCode: serviceRequest.serviceCode,
        deviceType: serviceRequest.deviceType,
        status: serviceRequest.status
      }
    });
  } catch (error: any) {
    console.error('Service request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
