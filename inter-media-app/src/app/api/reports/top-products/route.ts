import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Top selling products
    const topProducts = await Product.aggregate([
      { $match: { soldCount: { $gt: 0 } } },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $project: {
          name: 1,
          categoryName: '$category.name',
          price: 1,
          stock: 1,
          soldCount: 1,
          revenue: { $multiply: ['$price', '$soldCount'] }
        }
      },
      { $sort: { soldCount: -1 } },
      { $limit: 20 }
    ]);

    // Products by category sales
    const salesByCategory = await Product.aggregate([
      { $match: { soldCount: { $gt: 0 } } },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          totalSold: { $sum: '$soldCount' },
          totalRevenue: { $sum: { $multiply: ['$price', '$soldCount'] } },
          productCount: { $sum: 1 }
        }
      },
      { $sort: { totalSold: -1 } }
    ]);

    // Sales summary
    const salesSummary = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProductsSold: { $sum: '$soldCount' },
          totalRevenue: { $sum: { $multiply: ['$price', '$soldCount'] } },
          productsWithSales: {
            $sum: { $cond: [{ $gt: ['$soldCount', 0] }, 1, 0] }
          }
        }
      }
    ]);

    const summary = salesSummary[0] || {
      totalProductsSold: 0,
      totalRevenue: 0,
      productsWithSales: 0
    };

    return NextResponse.json({
      summary,
      topProducts,
      salesByCategory
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
