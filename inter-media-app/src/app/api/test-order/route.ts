import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { generateCode, getNextSequence } from '@/lib/utils-server';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating test order (bypassing auth)...');
    
    const body = await request.json();
    console.log('Request body:', body);
    
    const { customerInfo, shippingAddress, items, shipping, subtotal, shippingCost, total, paymentMethod = 'transfer' } = body;

    if (!customerInfo || !shippingAddress || !items || items.length === 0) {
      return NextResponse.json({ error: 'Data order tidak lengkap' }, { status: 400 });
    }

    await connectDB();

    // Validate products and update stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product || !product.isActive) {
        return NextResponse.json({ error: `Produk ${item.name} tidak tersedia` }, { status: 400 });
      }

      if (product.stock < item.qty) {
        return NextResponse.json({ error: `Stok ${product.name} tidak mencukupi. Tersedia: ${product.stock}` }, { status: 400 });
      }

      // Update stock
      product.stock -= item.qty;
      await product.save();
    }

    // Generate order number
    const orderNumber = await generateCode('ORDER');
    
    // Create order
    const order = new Order({
      orderNumber,
      customerInfo,
      shippingAddress,
      items,
      shipping,
      subtotal,
      shippingCost,
      total,
      status: 'pending',
      paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await order.save();

    console.log('Test order created:', order._id);

    return NextResponse.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      message: 'Order berhasil dibuat (test mode)'
    });

  } catch (error) {
    console.error('Error creating test order:', error);
    return NextResponse.json({ 
      error: error.message || 'Gagal membuat order' 
    }, { status: 500 });
  }
}
