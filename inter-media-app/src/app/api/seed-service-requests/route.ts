import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';

export async function POST() {
  try {
    await connectDB();
    
    const sampleRequests = [
      {
        serviceCode: 'SRV-001',
        userId: '696ee7c24cab9b631c561669',
        deviceType: 'printer',
        complaint: 'Printer tidak bisa mencetak, lampu error menyala terus',
        address: 'Jl. Sudirman No. 123, Jakarta Pusat',
        phone: '081234567890',
        status: 'received'
      },
      {
        serviceCode: 'SRV-002',
        userId: '696ee7c24cab9b631c561669', 
        deviceType: 'komputer',
        complaint: 'Komputer sering restart sendiri dan blue screen',
        address: 'Jl. Thamrin No. 456, Jakarta Pusat',
        phone: '081234567891',
        status: 'checking'
      },
      {
        serviceCode: 'SRV-003',
        userId: '696ee7c24cab9b631c561669',
        deviceType: 'fotocopy',
        complaint: 'Mesin fotocopy hasil cetakan buram dan bergaris',
        address: 'Jl. Gatot Subroto No. 789, Jakarta Selatan', 
        phone: '081234567892',
        status: 'repairing'
      }
    ];

    // Clear existing and insert sample data
    await ServiceRequest.deleteMany({});
    const created = await ServiceRequest.insertMany(sampleRequests);
    
    return NextResponse.json({ 
      message: 'Sample service requests created',
      count: created.length,
      requests: created
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
