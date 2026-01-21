import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await connectDB();

    // Create sample sales transactions (POS)
    const sampleSalesTransactions = [
      {
        transactionCode: 'POS-001',
        items: [
          { productId: new mongoose.Types.ObjectId(), name: 'Tinta Canon GI-790', qty: 2, price: 85000 },
          { productId: new mongoose.Types.ObjectId(), name: 'Kertas A4', qty: 5, price: 25000 }
        ],
        total: 295000,
        paymentMethod: 'cash',
        createdAt: new Date('2026-01-20'),
        transactionDate: new Date('2026-01-20')
      },
      {
        transactionCode: 'POS-002', 
        items: [
          { productId: new mongoose.Types.ObjectId(), name: 'Printer Canon', qty: 1, price: 1500000 }
        ],
        total: 1500000,
        paymentMethod: 'cash',
        createdAt: new Date('2026-01-19'),
        transactionDate: new Date('2026-01-19')
      }
    ];

    // Insert POS transactions
    await mongoose.connection.db.collection('salestransactions').insertMany(sampleSalesTransactions);

    // Update existing orders to confirmed status
    const updateResult = await mongoose.connection.db.collection('orders').updateMany(
      { status: 'pending' },
      { $set: { status: 'confirmed' } }
    );

    // Create sample confirmed orders if none exist
    const existingOrders = await mongoose.connection.db.collection('orders').countDocuments();
    
    if (existingOrders === 0) {
      const sampleOrders = [
        {
          orderCode: 'ORD-2026-001',
          userId: new mongoose.Types.ObjectId(),
          items: [
            { 
              productId: new mongoose.Types.ObjectId(), 
              nameSnapshot: 'Tinta Epson Original',
              priceSnapshot: 120000,
              qty: 3
            }
          ],
          subtotal: 360000,
          shippingCost: 15000,
          total: 375000,
          status: 'confirmed',
          paymentMethod: 'transfer',
          createdAt: new Date('2026-01-18')
        },
        {
          orderCode: 'ORD-2026-002',
          userId: new mongoose.Types.ObjectId(),
          items: [
            { 
              productId: new mongoose.Types.ObjectId(), 
              nameSnapshot: 'Printer HP LaserJet',
              priceSnapshot: 2500000,
              qty: 1
            }
          ],
          subtotal: 2500000,
          shippingCost: 25000,
          total: 2525000,
          status: 'shipped',
          paymentMethod: 'transfer',
          createdAt: new Date('2026-01-17')
        }
      ];

      await mongoose.connection.db.collection('orders').insertMany(sampleOrders);
    }

    return NextResponse.json({
      success: true,
      message: 'Sample sales data created successfully',
      posTransactions: sampleSalesTransactions.length,
      ordersUpdated: updateResult.modifiedCount,
      sampleOrdersCreated: existingOrders === 0 ? 2 : 0
    });

  } catch (error: any) {
    console.error('Create sample data error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
