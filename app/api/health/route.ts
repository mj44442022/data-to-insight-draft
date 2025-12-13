import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    geminiConfigured: !!process.env.GOOGLE_AI_API_KEY,
  });
}
