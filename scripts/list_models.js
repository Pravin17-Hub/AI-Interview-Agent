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
  const models = await ai.models.list();
  console.log('Available Gemini Models:');
  
  // Handing either array or paginated response
  const list = Array.isArray(models) ? models : (models.models || []);
  for (const m of list) {
    if (m.name.includes('gemini') && m.supportedActions && m.supportedActions.includes('generateContent')) {
      console.log(' -', m.name);
    }
  }
}

run().catch(console.error);
