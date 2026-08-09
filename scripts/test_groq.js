async function run() {
  const apiKey = process.env.GROQ_API_KEY || "";
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: 'Hello! Respond with "Groq is working!"' }]
    })
  });

  const json = await res.json();
  console.log('Groq Response:', JSON.stringify(json, null, 2));
}

run().catch(console.error);
