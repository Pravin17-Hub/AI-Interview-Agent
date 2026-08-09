const sessionId = 'test-session-' + Math.floor(Math.random() * 1000);

const candidate = {
  member: {
    id: "CAND-001",
    name: "Sarah Johnson",
    jobRole: "Senior Data Engineer",
    yearsExperience: 9,
    education: "MS Computer Science",
    status: "COMPLETED"
  },
  missions: [
    { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
    { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
    { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 2 },
    { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 4 },
    { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 1 },
    { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 2 },
    { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 2 },
    { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 3 },
    { day: 29, title: "Monitoring, Logging & Observability", skipped: true },
    { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
  ],
  signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 }
};

async function runTest() {
  console.log('--- STARTING INTERVIEW TEST ---');
  console.log('Session ID:', sessionId);

  // 1. Start Interview
  let res = await fetch('http://localhost:3000/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, candidate })
  });
  let data = await res.json();
  console.log('\n[Start Response]:', JSON.stringify(data, null, 2));

  // 2. First Turn
  res = await fetch('http://localhost:3000/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      message: "Yes, I am excited. Embeddings convert words and phrases into high-dimensional numerical vectors where similar meanings are close together."
    })
  });
  data = await res.json();
  console.log('\n[Turn 1 Response]:', JSON.stringify(data, null, 2));

  // 3. Second Turn (Drift / Gap Probing)
  res = await fetch('http://localhost:3000/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId,
      message: "I skipped the monitoring lesson because of work load, but I understand logging uses structured JSON logs in FastAPI, and metrics like latency and token usage are pushed to Prometheus."
    })
  });
  data = await res.json();
  console.log('\n[Turn 2 Response]:', JSON.stringify(data, null, 2));
}

runTest().catch(console.error);
