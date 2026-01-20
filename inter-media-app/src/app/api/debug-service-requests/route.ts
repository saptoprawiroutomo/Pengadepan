import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';

export async function GET() {
  try {
    await connectDB();
    
    const requests = await ServiceRequest.find({}).sort({ createdAt: -1 }).lean();
    
    return NextResponse.json({ 
      count: requests.length,
      requests: requests.slice(0, 5) // Show first 5
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
