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

async function run() {
  const res = await ai.models.list();
  console.log('Is pageInternal Array?', Array.isArray(res.pageInternal));
  console.log('Length:', res.pageInternal?.length);
  for (let i = 0; i < Math.min(res.pageInternal?.length || 0, 50); i++) {
    console.log(` - ${res.pageInternal[i].name}`);
  }
}

run().catch(console.error);
