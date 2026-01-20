import { NextResponse } from 'next/server';
import { setupProductionDB } from '@/lib/setup-production';

export async function GET() {
  try {
    const result = await setupProductionDB();
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Production database setup completed successfully',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to setup production database',
        details: result.error 
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Setup failed',
      message: error.message 
    }, { status: 500 });
  }
}
