import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import { generateJSON, generateText } from './llm';

// Interfaces for curriculum and candidate objects
interface DayInfo {
  day: number;
  title: string;
  type: string;
  tools: string[];
  objectives: string[];
}

interface Curriculum {
  cohort: string;
  modules: Array<{ n: number; title: string; days: number[] }>;
  days: DayInfo[];
}

interface CandidateMission {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
}

interface CandidateProfile {
  member: {
    id: string;
    name: string;
    jobRole: string;
    yearsExperience: number;
    education: string;
    status: string;
  };
  missions: CandidateMission[];
  signals: {
    commitDays: number;
    missionsCompleted: number;
    missionsFirstTry: number;
  };
}

interface AgendaItem {
  phase: string; // 'STRENGTH_PROBE' | 'GAP_PROBE' | 'PROJECT_PROBE' | 'BEHAVIORAL'
  targetDay: number;
  topic: string;
  targetObjectives: string[];
  suggestedQuestion: string;
}

// Schemas for structured outputs
const agendaSchema = {
  type: 'OBJECT' as const,
  description: 'Structured interview agenda containing technical questions.',
  properties: {
    agenda: {
      type: 'ARRAY' as const,
      description: 'List of interview questions covering strengths, gaps, and projects.',
      items: {
        type: 'OBJECT' as const,
        properties: {
          phase: { type: 'STRING' as const, description: 'Interview phase (e.g. STRENGTH_PROBE, GAP_PROBE, PROJECT_PROBE, BEHAVIORAL)' },
          targetDay: { type: 'INTEGER' as const, description: 'The day index in the curriculum being evaluated' },
          topic: { type: 'STRING' as const, description: 'The key topic or title of that curriculum day' },
          targetObjectives: {
            type: 'ARRAY' as const,
            items: { type: 'STRING' as const },
            description: 'Key lesson objectives we want to probe'
          },
          suggestedQuestion: { type: 'STRING' as const, description: 'The tailored question to ask the candidate' }
        },
        required: ['phase', 'targetDay', 'topic', 'targetObjectives', 'suggestedQuestion']
      }
    }
  },
  required: ['agenda']
};

const evaluationSchema = {
  type: 'OBJECT' as const,
  properties: {
    technicalAccuracy: { type: 'NUMBER' as const, description: 'Technical score between 0.0 (incorrect) and 1.0 (perfect)' },
    conceptualCoverage: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const },
      description: 'Key concepts or terms the candidate correctly explained'
    },
    missedConcepts: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const },
      description: 'Critical concepts or terms that the candidate should have mentioned but missed'
    },
    communicationScore: { type: 'NUMBER' as const, description: 'Clarity and formatting score between 0.0 and 1.0' },
    sentiment: { type: 'STRING' as const, description: 'Observed candidate confidence or stress state' },
    briefFeedback: { type: 'STRING' as const, description: 'One-sentence evaluation critique' }
  },
  required: ['technicalAccuracy', 'conceptualCoverage', 'missedConcepts', 'communicationScore', 'sentiment', 'briefFeedback']
};

const turnResponseSchema = {
  type: 'OBJECT' as const,
  properties: {
    evaluation: {
      type: 'OBJECT' as const,
      properties: {
        technicalAccuracy: { type: 'NUMBER' as const, description: 'Technical score between 0.0 (incorrect) and 1.0 (perfect)' },
        conceptualCoverage: {
          type: 'ARRAY' as const,
          items: { type: 'STRING' as const },
          description: 'Key concepts or terms the candidate correctly explained'
        },
        missedConcepts: {
          type: 'ARRAY' as const,
          items: { type: 'STRING' as const },
          description: 'Critical concepts or terms that the candidate should have mentioned but missed'
        },
        communicationScore: { type: 'NUMBER' as const, description: 'Clarity and formatting score between 0.0 and 1.0' },
        sentiment: { type: 'STRING' as const, description: 'Observed candidate confidence or stress state' },
        briefFeedback: { type: 'STRING' as const, description: 'One-sentence evaluation critique' }
      },
      required: ['technicalAccuracy', 'conceptualCoverage', 'missedConcepts', 'communicationScore', 'sentiment', 'briefFeedback']
    },
    reply: { type: 'STRING' as const, description: 'The next question, follow-up, or wrap-up response to the candidate.' },
    shouldAdvance: { type: 'BOOLEAN' as const, description: 'True if advancing to the next question, false if asking a follow-up.' }
  },
  required: ['evaluation', 'reply', 'shouldAdvance']
};

const finalFeedbackSchema = {
  type: 'OBJECT' as const,
  properties: {
    summary: { type: 'STRING' as const, description: 'Detailed executive summary of the candidate performance' },
    overallRating: { type: 'NUMBER' as const, description: 'Overall interview performance rating score out of 5 stars (from 1.0 to 5.0, where 5.0 is perfect)' },
    strengths: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const },
      description: 'List of key technical strengths observed'
    },
    gaps: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const },
      description: 'List of technical gaps and areas that need improvement'
    },
    next: {
      type: 'ARRAY' as const,
      items: { type: 'STRING' as const },
      description: 'List of actionable study/practice recommendations linked to specific modules/days'
    }
  },
  required: ['summary', 'overallRating', 'strengths', 'gaps', 'next']
};

// Helper to load curriculum data
function loadCurriculum(): Curriculum {
  const filePath = path.join(process.cwd(), 'public/data/curriculum.json');
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as Curriculum;
}

// 1. Session Initialization
export async function initializeSession(sessionId: string, candidate: CandidateProfile): Promise<string> {
  const curriculum = loadCurriculum();

  // Find strength days: passed on first try (attempts === 1)
  const strengthMissions = candidate.missions.filter(m => m.passed && m.attempts === 1);
  // Find gap days: skipped, passed but with high attempts (attempts >= 3), or failed
  const gapMissions = candidate.missions.filter(m => m.skipped || (m.attempts && m.attempts >= 3) || m.passed === false);

  // Map candidate missions to full curriculum details
  const strengthDaysDetails = strengthMissions.map(m => curriculum.days.find(d => d.day === m.day)).filter(Boolean) as DayInfo[];
  const gapDaysDetails = gapMissions.map(m => curriculum.days.find(d => d.day === m.day)).filter(Boolean) as DayInfo[];
  const capstoneDay = curriculum.days.find(d => d.day === 31);

  // Ask Planner Agent to generate a custom agenda
  const plannerSystemPrompt = `You are the Lead Interview Planner. Your task is to design a highly personalized 5-question interview agenda based on the candidate's cohort details and the official curriculum objectives.
Curriculum Cohort: ${curriculum.cohort}

Candidate Job Role: ${candidate.member.jobRole}
Years Experience: ${candidate.member.yearsExperience}

Strengths from Cohort (Aced on 1st try):
${JSON.stringify(strengthDaysDetails.slice(0, 3))}

Gaps from Cohort (Skipped or took 3+ attempts):
${JSON.stringify(gapDaysDetails.slice(0, 3))}

Capstone Lesson (Verify integration):
${JSON.stringify(capstoneDay)}`;

  const plannerUserPrompt = `Create a custom, structured agenda with exactly 4 core technical questions.
- Question 1 (STRENGTH_PROBE): Welcome the candidate. Ask a direct technical question about one of their strength modules.
- Question 2 (GAP_PROBE): Ask a question testing their understanding of one of their gap/skipped modules. Check if they understand the concepts now.
- Question 3 (PROJECT_PROBE): Ask a scenario-based system architecture question linked to their Capstone build (Day 31).
- Question 4 (BEHAVIORAL): Ask a behavioral question about their experience, commit consistency, or collaborating during the cohort.

Ensure all technical questions name specific objectives and tools from the corresponding curriculum days.
Output a JSON array matching the required format.`;

  const plannerResponse = await generateJSON<any>(plannerUserPrompt, agendaSchema, plannerSystemPrompt, 'gemini-2.5-flash');
  
  let agenda: AgendaItem[] = [];
  if (Array.isArray(plannerResponse)) {
    agenda = plannerResponse;
  } else if (plannerResponse && Array.isArray(plannerResponse.agenda)) {
    agenda = plannerResponse.agenda;
  } else if (plannerResponse && Array.isArray(plannerResponse.interview_agenda)) {
    agenda = plannerResponse.interview_agenda.map((item: any) => ({
      phase: item.question_type || item.phase || 'STRENGTH_PROBE',
      targetDay: item.targetDay || 7,
      topic: item.topic || 'Embeddings',
      targetObjectives: item.targetObjectives || [],
      suggestedQuestion: item.question || item.suggestedQuestion || ''
    }));
  }

  // Welcome message from the speaker agent
  const welcomeSystemPrompt = `You are a professional, friendly technical interviewer. Welcome the candidate by name, review their overall success in the cohort, and start the interview by asking the first question on the agenda.`;
  const welcomeUserPrompt = `Candidate Name: ${candidate.member.name}
  Overall cohort completion signals: ${JSON.stringify(candidate.signals)}
  Agenda: ${JSON.stringify(agenda)}
  First Question on Agenda: ${agenda[0]?.suggestedQuestion}`;

  const welcomeMessage = await generateText(welcomeUserPrompt, welcomeSystemPrompt);

  // Save Session in SQLite database
  await prisma.session.create({
    data: {
      id: sessionId,
      candidateId: candidate.member.id,
      candidateName: candidate.member.name,
      jobRole: candidate.member.jobRole,
      status: 'IN_PROGRESS',
      currentPhase: agenda[0]?.phase || 'STRENGTH_PROBE',
      currentQuestionIndex: 0,
      agendaJson: JSON.stringify(agenda),
      messages: {
        create: [
          {
            role: 'assistant',
            content: welcomeMessage,
            evaluationJson: null
          }
        ]
      }
    }
  });

  return welcomeMessage;
}

// 2. Process Conversation Turn
export async function processTurn(
  sessionId: string,
  userMessage: string
): Promise<{ reply: string; done: boolean; feedback?: any }> {
  // Retrieve session and message history
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { timestamp: 'asc' } } }
  });

  if (!session) {
    throw new Error(`Session with ID ${sessionId} not found.`);
  }

  if (session.status === 'COMPLETED') {
    const feedback = {
      summary: session.summary || '',
      strengths: JSON.parse(session.strengthsJson || '[]'),
      gaps: JSON.parse(session.gapsJson || '[]'),
      next: JSON.parse(session.nextJson || '[]')
    };
    return { reply: 'Interview is already completed.', done: true, feedback };
  }

  const curriculum = loadCurriculum();
  const rawAgenda = JSON.parse(session.agendaJson);
  let agenda: AgendaItem[] = [];
  if (Array.isArray(rawAgenda)) {
    agenda = rawAgenda;
  } else if (rawAgenda && typeof rawAgenda === 'object') {
    if (Array.isArray(rawAgenda.agenda)) {
      agenda = rawAgenda.agenda;
    } else if (Array.isArray(rawAgenda.interview_agenda)) {
      agenda = rawAgenda.interview_agenda.map((item: any) => ({
        phase: item.question_type || item.phase || 'STRENGTH_PROBE',
        targetDay: item.targetDay || 7,
        topic: item.topic || 'Embeddings',
        targetObjectives: item.targetObjectives || [],
        suggestedQuestion: item.question || item.suggestedQuestion || ''
      }));
    }
  }
  const activeQuestionIndex = session.currentQuestionIndex;
  const activeAgendaItem = agenda[activeQuestionIndex];

  const nextQuestionIndex = activeQuestionIndex + 1;
  const isAgendaFinished = nextQuestionIndex >= agenda.length;
  const nextAgendaItem = agenda[nextQuestionIndex];

  // Helper check: if the last interviewer prompt was already a follow-up, do not loop indefinitely
  const assistantMessages = session.messages.filter(m => m.role === 'assistant');
  const lastAssistantMessage = assistantMessages[assistantMessages.length - 1];
  const wasLastFollowUp = lastAssistantMessage ? lastAssistantMessage.content.toLowerCase().includes('follow-up') || lastAssistantMessage.content.toLowerCase().includes('clarify') : false;

  // 1. Candidate Response Evaluator & Next Turn Director Agent
  const targetDayDetails = curriculum.days.find(d => d.day === activeAgendaItem?.targetDay);
  
  const combinedSystemPrompt = `You are a professional, friendly but rigorous technical interviewer and evaluator.
Your job is to perform two tasks in a single turn:
1. Grade the candidate's response against the curriculum objectives and active question.
2. Formulate the next response.
   - If technicalAccuracy is low (< 0.6) and the last interviewer question was NOT already a follow-up/clarification, you must follow up on the current topic. In this case, set "shouldAdvance" to false and generate a constructive, helpful follow-up question in "reply" to probe deeper.
   - Otherwise, you must advance to the next agenda item. In this case, set "shouldAdvance" to true and transition smoothly from their answer, then present the next question in "reply".

Curriculum Context for Active Question (Day ${activeAgendaItem?.targetDay} - ${activeAgendaItem?.topic}):
Tools: ${JSON.stringify(targetDayDetails?.tools || [])}
Objectives: ${JSON.stringify(targetDayDetails?.objectives || [])}

Active Question Asked: "${session.messages[session.messages.length - 1]?.content}"
Was the last question already a follow-up? ${wasLastFollowUp ? 'YES' : 'NO'}

Next Question (use this ONLY if advancing/shouldAdvance is true):
${isAgendaFinished ? 'NO MORE QUESTIONS (Acknowledge candidate response and wrap up/conclude the interview session)' : `Topic: ${nextAgendaItem?.topic}\nQuestion: ${nextAgendaItem?.suggestedQuestion}`}
`;

  const combinedUserPrompt = `Candidate Response: "${userMessage}"
Evaluate their response and determine the next turn response. Return the result in the requested JSON structure.`;

  const turnResult = await generateJSON<any>(combinedUserPrompt, turnResponseSchema, combinedSystemPrompt);

  // Save the user's message and evaluation in the database
  await prisma.message.create({
    data: {
      sessionId,
      role: 'user',
      content: userMessage,
      evaluationJson: JSON.stringify(turnResult.evaluation)
    }
  });

  if (!turnResult.shouldAdvance) {
    // LLM decided to follow up on current topic
    await prisma.message.create({
      data: {
        sessionId,
        role: 'assistant',
        content: turnResult.reply
      }
    });

    return { reply: turnResult.reply, done: false };
  } else if (!isAgendaFinished) {
    // LLM decided to advance, and there is a next question
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        currentQuestionIndex: nextQuestionIndex,
        currentPhase: nextAgendaItem?.phase || 'STRENGTH_PROBE'
      }
    });

    await prisma.message.create({
      data: {
        sessionId,
        role: 'assistant',
        content: turnResult.reply
      }
    });

    return { reply: turnResult.reply, done: false };
  } else {
    // LLM decided to advance, and we are finished!
    const feedback = await generateFinalReport(sessionId);

    await prisma.message.create({
      data: {
        sessionId,
        role: 'assistant',
        content: turnResult.reply
      }
    });

    return { reply: turnResult.reply, done: true, feedback };
  }
}

/**
 * Compiles and saves the final evaluation report for a session.
 * Exposes a reusable endpoint to generate/regenerate reports on-demand.
 */
export async function generateFinalReport(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { messages: { orderBy: { timestamp: 'asc' } } }
  });

  if (!session) {
    throw new Error('Session not found');
  }

  const allMessages = session.messages;
  const userMessages = allMessages.filter(m => m.role === 'user');

  if (userMessages.length === 0) {
    const zeroReport = {
      summary: "Assessment terminated before any questions were answered. No evaluation was possible.",
      overallRating: 0.0,
      strengths: [],
      gaps: ["No answers submitted for evaluation."],
      next: ["Re-attempt the technical assessment from the start."]
    };

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        summary: zeroReport.summary,
        strengthsJson: JSON.stringify(zeroReport.strengths),
        gapsJson: JSON.stringify(zeroReport.gaps),
        nextJson: JSON.stringify(zeroReport.next),
        overallRating: 0.0
      }
    });

    return zeroReport;
  }

  const synthesizerSystemPrompt = `You are the Chief Evaluation Officer. Your task is to aggregate the complete chat history and turn-by-turn evaluations to write a detailed, constructive feedback report.
Candidate Name: ${session.candidateName}
Job Role: ${session.jobRole}`;

  const transcriptSummary = allMessages.map(m => {
    const evalText = m.evaluationJson ? `\n[AI Evaluation]: ${m.evaluationJson}` : '';
    return `${m.role.toUpperCase()}: ${m.content}${evalText}`;
  }).join('\n\n');

  const feedback = await generateJSON<any>(
    `Transcript & Turn-by-Turn Evaluations:\n${transcriptSummary}\n\nCompile the final summary feedback satisfying the required schema. Ensure recommendations link back to specific modules or days in the curriculum.`,
    finalFeedbackSchema,
    synthesizerSystemPrompt,
    'gemini-2.5-flash'
  );

  // Update session record with completed report
  await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: 'COMPLETED',
      summary: feedback.summary,
      strengthsJson: JSON.stringify(feedback.strengths),
      gapsJson: JSON.stringify(feedback.gaps),
      nextJson: JSON.stringify(feedback.next),
      // @ts-ignore
      overallRating: feedback.overallRating || 0
    }
  });

  return feedback;
}
