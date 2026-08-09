import { NextRequest, NextResponse } from 'next/server';
import { initializeSession, processTurn, generateFinalReport } from '@/lib/ai-orchestrator';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, candidate, message, done } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    if (done === true) {
      // Force End Interview & generate final report
      const finalReport = await generateFinalReport(sessionId);
      return NextResponse.json({
        done: true,
        feedback: finalReport
      });
    }

    if (candidate) {
      // Start Interview
      const welcomeMessage = await initializeSession(sessionId, candidate);
      return NextResponse.json({
        reply: welcomeMessage,
        done: false
      });
    } else if (message !== undefined) {
      // Conversation Turn
      const turnResult = await processTurn(sessionId, message);
      return NextResponse.json(turnResult);
    } else {
      return NextResponse.json({ error: 'Either candidate, message or done is required' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Error in POST /api/interview:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const regenerate = searchParams.get('regenerate');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    if (regenerate === 'true') {
      await generateFinalReport(sessionId);
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { timestamp: 'asc' } } }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(session);
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
