import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Simple admin users API called');
    
    const body = await request.json();
    console.log('Received data:', body);
    
    return NextResponse.json({ 
      message: 'Data received successfully',
      received: body 
    });
  } catch (error: any) {
    console.error('Simple admin users error:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}
