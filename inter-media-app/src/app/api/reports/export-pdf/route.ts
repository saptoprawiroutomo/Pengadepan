import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'PDF export feature is disabled' }, { status: 501 });
}
