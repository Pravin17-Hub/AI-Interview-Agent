const fs = require('fs');
const path = require('path');

// Manual .env parser
const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const matches = envContent.matchAll(/GEMINI_API_KEY="?([^"\s]+)"?/g);
let apiKey = null;
for (const match of matches) {
  apiKey = match[1]; // Get the last one
}

if (!apiKey) {
  console.error('No API key found');
  process.exit(1);
}

const payload = {
  contents: [{ parts: [{ text: "Hello! Respond with 'HTTP is working!'" }] }]
};

async function testQueryParam() {
  console.log('1. Testing as query parameter...');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    console.log('Query Param Success:', res.ok, JSON.stringify(json).substring(0, 200));
  } catch (err) {
    console.error('Query Param Error:', err);
  }
}

async function testHeaderKey() {
  console.log('\n2. Testing as x-goog-api-key header...');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    console.log('Header Key Success:', res.ok, JSON.stringify(json).substring(0, 200));
  } catch (err) {
    console.error('Header Key Error:', err);
  }
}

async function testBearer() {
  console.log('\n3. Testing as Authorization Bearer header...');
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    console.log('Bearer Success:', res.ok, JSON.stringify(json).substring(0, 200));
  } catch (err) {
    console.error('Bearer Error:', err);
  }
}

async function run() {
  await testQueryParam();
  await testHeaderKey();
  await testBearer();
}

run().catch(console.error);
