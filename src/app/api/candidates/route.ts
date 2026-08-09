import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const candidatesPath = path.join(process.cwd(), 'public/data/candidates.json');
    const curriculumPath = path.join(process.cwd(), 'public/data/curriculum.json');

    const candidatesData = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
    const curriculumData = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

    // Fetch session statuses from database to sync Candidate Matrix status dynamically
    let sessions: any[] = [];
    try {
      sessions = await prisma.session.findMany({
        select: { candidateId: true, status: true }
      });
    } catch (dbError) {
      console.warn('[Candidates API] Database or session table not found. Defaulting status to NOT_STARTED.', dbError);
    }

    const sessionMap = new Map(sessions.map(s => [s.candidateId, s.status]));

    const syncedCandidates = candidatesData.candidates.map((c: any) => {
      const dbStatus = sessionMap.get(c.member.id);
      if (dbStatus) {
        c.member.status = dbStatus;
      } else {
        c.member.status = 'NOT_STARTED';
      }
      return c;
    });

    return NextResponse.json({
      candidates: syncedCandidates,
      curriculum: curriculumData
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const newCandidate = await req.json();
    const candidatesPath = path.join(process.cwd(), 'public/data/candidates.json');
    const fileContent = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
    
    // Validate basic properties
    if (!newCandidate.member || !newCandidate.member.id || !newCandidate.member.name) {
      return NextResponse.json({ error: 'Invalid candidate structure. Must contain member.id and member.name' }, { status: 400 });
    }

    // Check duplicate ID
    const exists = fileContent.candidates.some((c: any) => c.member.id === newCandidate.member.id);
    if (exists) {
      return NextResponse.json({ error: `Candidate with ID ${newCandidate.member.id} already exists.` }, { status: 400 });
    }

    fileContent.candidates.push(newCandidate);
    fs.writeFileSync(candidatesPath, JSON.stringify(fileContent, null, 2), 'utf8');

    return NextResponse.json({ success: true, candidates: fileContent.candidates });
  } catch (error: any) {
    console.error('Error adding new candidate:', error);
    return NextResponse.json({ error: error.message || 'Failed to add candidate' }, { status: 500 });
  }
}
