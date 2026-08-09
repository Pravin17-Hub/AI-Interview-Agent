const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const session = await prisma.session.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { messages: true }
  });
  console.log('Session ID:', session.id);
  for (const m of session.messages) {
    if (m.role === 'user') {
      console.log(`User: "${m.content}"`);
      console.log('Evaluation:', m.evaluationJson);
    }
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
