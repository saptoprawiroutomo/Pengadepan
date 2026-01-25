import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';
import { calculateSLATarget, getSLAStatus } from '@/lib/sla-utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let requests;
    
    // Admin/Kasir bisa lihat semua request
    if (['admin', 'kasir'].includes(session.user.role)) {
      requests = await ServiceRequest.find({})
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      // Customer hanya bisa lihat request mereka sendiri
      requests = await ServiceRequest.find({ userId: session.user.id })
        .sort({ createdAt: -1 })
        .lean();
    }

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Fetch service requests error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Silakan login terlebih dahulu' }, { status: 401 });
    }

    const body = await request.json();
    const { deviceType, complaint, phone, address, priority = 'normal' } = body;

    if (!deviceType || !complaint || !phone || !address) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    await connectDB();

    // Generate service code
    const serviceCode = 'SRV-' + Date.now();
    const createdAt = new Date();
    
    // Calculate SLA target
    const slaTarget = calculateSLATarget(deviceType, priority, createdAt);
    const slaStatus = getSLAStatus(slaTarget);

    const serviceRequest = await ServiceRequest.create({
      serviceCode,
      userId: session.user.id, // Wajib ada userId
      deviceType,
      complaint,
      address,
      phone,
      priority,
      slaTarget,
      slaStatus,
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
