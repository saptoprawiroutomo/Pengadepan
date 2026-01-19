import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';
import { z } from 'zod';

const updateServiceSchema = z.object({
  status: z.enum(['received', 'checking', 'repairing', 'done', 'delivered', 'cancelled']).optional(),
  laborCost: z.number().min(0).optional(),
  partsCost: z.number().min(0).optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session || !['admin', 'kasir'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateServiceSchema.parse(body);

    await connectDB();

    // Calculate total cost
    const updateData: any = { ...validatedData };
    if (validatedData.laborCost !== undefined || validatedData.partsCost !== undefined) {
      const service = await ServiceRequest.findById(params.id);
      if (service) {
        const laborCost = validatedData.laborCost ?? service.laborCost;
        const partsCost = validatedData.partsCost ?? service.partsCost;
        updateData.totalCost = laborCost + partsCost;
      }
    }

    const service = await ServiceRequest.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true }
    ).populate('userId', 'name email phone');

    if (!service) {
      return NextResponse.json({ error: 'Service tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
