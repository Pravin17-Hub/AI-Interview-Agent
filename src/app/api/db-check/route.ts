import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Run a simple test query to verify database connection
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    return NextResponse.json({
      status: 'success',
      message: 'Successfully connected to the database!',
      queryResult: result,
      env: {
        hasGroqKey: !!process.env.GROQ_API_KEY,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 25) + '...' : 'none'
      }
    });
  } catch (error: any) {
    console.error('Database diagnostic check failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to the database.',
      error: error.message || error,
      prismaErrorMeta: error.meta || null,
      prismaErrorCode: error.code || null,
      env: {
        hasGroqKey: !!process.env.GROQ_API_KEY,
        hasGeminiKey: !!process.env.GEMINI_API_KEY,
        dbUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 25) + '...' : 'none'
      }
    }, { status: 500 });
  }
}
