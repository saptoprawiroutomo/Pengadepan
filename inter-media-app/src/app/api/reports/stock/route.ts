import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import Product from '@/models/Product';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Stock report
    const stockReport = await Product.aggregate([
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
          stockValue: { $multiply: ['$price', '$stock'] },
          isActive: 1,
          stockStatus: {
            $cond: {
              if: { $eq: ['$stock', 0] },
              then: 'out_of_stock',
              else: {
                $cond: {
                  if: { $lte: ['$stock', 5] },
                  then: 'low_stock',
                  else: 'in_stock'
                }
              }
            }
          }
        }
      },
      { $sort: { stock: 1, name: 1 } }
    ]);

    // Stock summary
    const stockSummary = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          outOfStock: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] }
          },
          lowStock: {
            $sum: { $cond: [{ $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', 5] }] }, 1, 0] }
          }
        }
      }
    ]);

    // Stock by category
    const stockByCategory = await Product.aggregate([
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
          productCount: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    const summary = stockSummary[0] || {
      totalProducts: 0,
      totalStock: 0,
      totalValue: 0,
      outOfStock: 0,
      lowStock: 0
    };

    return NextResponse.json({
      summary,
      stockReport,
      stockByCategory
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
