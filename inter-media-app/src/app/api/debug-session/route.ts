import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      hasSession: !!session,
      user: session?.user || null,
      sessionData: session || null
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      hasSession: false 
    }, { status: 500 });
  }
}
