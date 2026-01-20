import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import SalesTransaction from '@/models/SalesTransaction';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'kasir'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const transactions = await SalesTransaction.find()
      .populate('cashierId', 'name')
      .populate('items.productId', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
