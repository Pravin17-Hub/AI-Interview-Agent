const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with mock interview session reports...');

  // Clean existing sessions
  await prisma.message.deleteMany();
  await prisma.session.deleteMany();

  // Create completed session for Sarah Johnson (CAND-001)
  await prisma.session.create({
    data: {
      id: 'sess-sarah-johnson',
      candidateId: 'CAND-001',
      candidateName: 'Sarah Johnson',
      jobRole: 'Senior Data Engineer',
      status: 'COMPLETED',
      currentPhase: 'WRAP_UP',
      currentQuestionIndex: 5,
      agendaJson: JSON.stringify([
        { phase: 'ICEBREAKER', topic: 'Introductions' },
        { phase: 'STRENGTH_PROBE', topic: 'Data Architectures' },
        { phase: 'GAP_PROBE', topic: 'Docker Containerization' }
      ]),
      summary: 'Sarah demonstrated outstanding architecture design skills and deep familiarity with big data engines. She has solid experience with spark and large-scale data modeling. Minor gap observed in basic Docker setup workflows.',
      strengthsJson: JSON.stringify([
        'Superb big-data modeling and system architecture foundations',
        'Strong production experience with Apache Spark and data pipelining',
        'Clear and structured technical communication'
      ]),
      gapsJson: JSON.stringify([
        'Basic Docker containerization and Kubernetes orchestration workflows could be polished'
      ]),
      nextJson: JSON.stringify([
        'Review curriculum materials on Day 28 (Docker & Kubernetes Deployment)'
      ]),
      overallRating: 4.5,
      messages: {
        create: [
          { role: 'assistant', content: 'Welcome to the interview! Can you introduce yourself?' },
          { role: 'user', content: 'Hi, I am Sarah. I have been working as a Data Engineer for 9 years, primarily designing pipeline architectures.' },
          { role: 'assistant', content: 'Great. How do you design pipelines for handling large-scale real-time streams?' },
          { role: 'user', content: 'I typically use Apache Kafka as the buffer layer and run Spark Streaming jobs to store processed data in a data lake.' }
        ]
      }
    }
  });

  // Create completed session for Alex Turner (CAND-002)
  await prisma.session.create({
    data: {
      id: 'sess-alex-turner',
      candidateId: 'CAND-002',
      candidateName: 'Alex Turner',
      jobRole: 'Backend Software Engineer',
      status: 'COMPLETED',
      currentPhase: 'WRAP_UP',
      currentQuestionIndex: 4,
      agendaJson: JSON.stringify([
        { phase: 'ICEBREAKER', topic: 'Introductions' },
        { phase: 'STRENGTH_PROBE', topic: 'API Design' }
      ]),
      summary: 'Alex shows sound competence in RESTful API development and databases. He explained SQL query optimizations clearly. However, multi-agent orchestration and design patterns are areas that need review.',
      strengthsJson: JSON.stringify([
        'Sound experience in relational database schemas and SQL optimizations',
        'Clear understanding of RESTful API best practices'
      ]),
      gapsJson: JSON.stringify([
        'Lacks depth in advanced multi-agent orchestrations and Model Context Protocols'
      ]),
      nextJson: JSON.stringify([
        'Go through Day 22 (Multi-Agent Orchestration) and Day 23 (Model Context Protocol)'
      ]),
      overallRating: 3.5,
      messages: {
        create: [
          { role: 'assistant', content: 'Welcome Alex. Let\'s discuss your backend engineering journey.' },
          { role: 'user', content: 'I have 5 years of experience building Node.js REST APIs and managing PostgreSQL databases.' }
        ]
      }
    }
  });

  console.log('Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
