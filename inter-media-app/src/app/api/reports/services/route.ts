import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import ServiceRequest from '@/models/ServiceRequest';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    await connectDB();

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    const matchStage = dateFilter.createdAt ? { createdAt: dateFilter } : {};

    // Service summary
    const serviceSummary = await ServiceRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalServices: { $sum: 1 },
          totalRevenue: { $sum: '$totalCost' },
          avgCost: { $avg: '$totalCost' }
        }
      }
    ]);

    // Services by status
    const servicesByStatus = await ServiceRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$totalCost' }
        }
      }
    ]);

    // Services by device type
    const servicesByDevice = await ServiceRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$deviceType',
          count: { $sum: 1 },
          totalCost: { $sum: '$totalCost' },
          avgCost: { $avg: '$totalCost' }
        }
      }
    ]);

    // Daily services
    const dailyServices = await ServiceRequest.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          serviceCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalCost' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Recent services
    const recentServices = await ServiceRequest.find(matchStage)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    const summary = serviceSummary[0] || { totalServices: 0, totalRevenue: 0, avgCost: 0 };

    return NextResponse.json({
      summary,
      servicesByStatus,
      servicesByDevice,
      dailyServices,
      recentServices
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
