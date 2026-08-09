const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

// Manual .env parser
const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf8');
const matches = envContent.matchAll(/GEMINI_API_KEY="?([^"\s]+)"?/g);
let apiKey = null;
for (const match of matches) {
  apiKey = match[1]; // Get the last one
}

console.log('Parsed API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'not found');

if (!apiKey) {
  console.error('No API key found in .env');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function run() {
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: 'Hello! Respond with "API is working!"'
  });
  console.log('Response:', response.text);
}

run().catch(console.error);
