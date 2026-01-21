import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectDB from '@/lib/db';
import mongoose from 'mongoose';
import Product from '@/models/Product';

export async function GET() {
  try {
    // Temporarily disable auth for testing
    // const session = await getServerSession(authOptions);
    // if (!session || session.user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    await connectDB();

    // Get sales from completed orders
    const completedOrders = await mongoose.connection.db.collection('orders')
      .find({ 
        status: { $in: ['confirmed', 'shipped', 'delivered'] } 
      })
      .toArray();

    // Get sales from POS transactions
    const posTransactions = await mongoose.connection.db.collection('salestransactions')
      .find({})
      .toArray();

    // Calculate product sales from orders
    const productSales = {};
    
    // Process online orders
    completedOrders.forEach(order => {
      order.items?.forEach(item => {
        const productId = item.productId?._id || item.productId;
        const productName = item.nameSnapshot || item.productId?.name || 'Unknown Product';
        const qty = item.qty || 0;
        const price = item.priceSnapshot || item.productId?.price || 0;
        
        if (!productSales[productId]) {
          productSales[productId] = {
            _id: productId,
            name: productName,
            soldCount: 0,
            revenue: 0
          };
        }
        
        productSales[productId].soldCount += qty;
        productSales[productId].revenue += (qty * price);
      });
    });

    // Process POS transactions
    posTransactions.forEach(transaction => {
      transaction.items?.forEach(item => {
        const productId = item.productId?._id || item.productId;
        const productName = item.name || item.productId?.name || 'Unknown Product';
        const qty = item.qty || item.quantity || 0;
        const price = item.price || item.productId?.price || 0;
        
        if (!productSales[productId]) {
          productSales[productId] = {
            _id: productId,
            name: productName,
            soldCount: 0,
            revenue: 0
          };
        }
        
        productSales[productId].soldCount += qty;
        productSales[productId].revenue += (qty * price);
      });
    });

    // Convert to array and sort by soldCount
    const topProducts = Object.values(productSales)
      .filter(product => product.soldCount > 0)
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 20);

    // Calculate category sales from actual sales data
    const categorySales = {};
    
    // Get product details for category mapping
    const products = await mongoose.connection.db.collection('products')
      .find({})
      .toArray();
    
    const categories = await mongoose.connection.db.collection('categories')
      .find({})
      .toArray();
    
    // Create product-category mapping
    const productCategoryMap = {};
    products.forEach(product => {
      const category = categories.find(cat => cat._id.toString() === product.categoryId?.toString());
      productCategoryMap[product._id.toString()] = category?.name || 'Uncategorized';
    });
    
    // Calculate category sales from product sales
    Object.values(productSales).forEach(product => {
      const categoryName = productCategoryMap[product._id?.toString()] || 'Uncategorized';
      
      if (!categorySales[categoryName]) {
        categorySales[categoryName] = {
          _id: categoryName,
          totalSold: 0,
          totalRevenue: 0,
          productCount: 0
        };
      }
      
      categorySales[categoryName].totalSold += product.soldCount;
      categorySales[categoryName].totalRevenue += product.revenue;
      categorySales[categoryName].productCount += 1;
    });

    const salesByCategory = Object.values(categorySales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate sales summary
    const totalProductsSold = Object.values(productSales).reduce((sum, product) => sum + product.soldCount, 0);
    const totalRevenue = Object.values(productSales).reduce((sum, product) => sum + product.revenue, 0);
    const productsWithSales = Object.keys(productSales).length;

    const summary = {
      totalProductsSold,
      totalRevenue,
      productsWithSales
    };

    return NextResponse.json({
      summary,
      topProducts,
      salesByCategory
    });

  } catch (error: any) {
    console.error('Top products report error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
