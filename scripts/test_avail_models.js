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

const ai = new GoogleGenAI({ apiKey });

const candidates = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.0-flash-lite',
  'gemini-flash-latest',
  'gemini-pro-latest',
  'gemini-flash-lite-latest'
];

async function run() {
  for (const m of candidates) {
    try {
      console.log(`Testing model: ${m}...`);
      const response = await ai.models.generateContent({
        model: m,
        contents: 'Test'
      });
      console.log(` ✅ SUCCESS: ${m}`);
      return;
    } catch (err) {
      console.log(` ❌ FAILED: ${m} - ${err.message.substring(0, 150)}`);
    }
  }
  console.log('No models succeeded.');
}

run().catch(console.error);
