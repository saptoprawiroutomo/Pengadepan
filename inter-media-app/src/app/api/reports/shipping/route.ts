import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    // Get shipping data - include all orders that have shipping info
    const shippingFilter = {
      ...dateFilter,
      $or: [
        { status: { $in: ['shipped', 'done', 'paid', 'processed'] } },
        { shippingAddress: { $exists: true, $ne: '' } }
      ]
    };

    const shipments = await Order.find(shippingFilter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate summary
    const totalShipments = shipments.length;
    const delivered = shipments.filter(order => order.status === 'done').length;
    const shipped = shipments.filter(order => order.status === 'shipped').length;
    const processed = shipments.filter(order => ['paid', 'processed'].includes(order.status)).length;
    const inTransit = shipped + processed;
    const totalShippingCost = shipments.reduce((sum, order) => sum + (order.shippingCost || 0), 0);

    // Format shipments data
    const formattedShipments = shipments.map(order => ({
      orderNumber: order.orderCode,
      customerName: order.userId?.name || 'Customer',
      shippingAddress: order.shippingAddress || 'Alamat tidak tersedia',
      courier: order.courier || order.shippingCourier || 'JNE',
      status: order.status,
      shippingCost: order.shippingCost || 0,
      shippedAt: order.shippedAt,
      createdAt: order.createdAt
    }));

    return NextResponse.json({
      success: true,
      summary: {
        totalShipments,
        delivered,
        inTransit,
        totalShippingCost
      },
      shipments: formattedShipments
    });

  } catch (error) {
    console.error('Shipping report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate shipping report' },
      { status: 500 }
    );
  }
}
