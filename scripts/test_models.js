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
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-2.0-pro-exp-02-05',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro-latest'
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
      // Return the successful model name so we know
    } catch (err) {
      console.log(` ❌ FAILED: ${m} - ${err.message.substring(0, 150)}`);
    }
  }
}

run().catch(console.error);
