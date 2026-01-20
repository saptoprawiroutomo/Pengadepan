import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import SalesTransaction from '@/models/SalesTransaction';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session || !['admin', 'kasir'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const transaction = await SalesTransaction.findById(id)
      .populate('cashierId', 'name')
      .populate('items.productId', 'name price');

    if (!transaction) {
      return NextResponse.json({ error: 'Transaksi tidak ditemukan' }, { status: 404 });
    }

    // Generate receipt data for popup
    const receiptData = {
      transactionCode: transaction.transactionCode,
      date: transaction.createdAt.toLocaleDateString('id-ID'),
      time: transaction.createdAt.toLocaleTimeString('id-ID'),
      cashier: transaction.cashierId.name,
      customerName: transaction.customerName || 'Walk-in Customer',
      items: transaction.items.map((item: any) => ({
        name: item.nameSnapshot || item.productId.name,
        qty: item.qty,
        price: item.priceSnapshot || item.productId.price,
        subtotal: item.subtotal
      })),
      total: transaction.total,
      storeName: 'Inter Medi-A',
      storeAddress: 'Jln Klingkit Dalam Blok C No 22, RT 010/011\nRawa Buaya, Cengkareng, Jakarta Barat 11470',
      storePhone: '(021) 1234-5678'
    };

    return NextResponse.json(receiptData);
  } catch (error: any) {
    console.error('Error generating receipt:', error);
    return NextResponse.json({ error: 'Gagal generate receipt' }, { status: 500 });
  }
}
