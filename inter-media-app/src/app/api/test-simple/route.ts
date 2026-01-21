import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Simple test API called');
    return NextResponse.json({ message: 'Test successful' });
  } catch (error: any) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Test GET successful' });
}
