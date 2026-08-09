import { GoogleGenAI } from '@google/genai';

const geminiApiKey = process.env.GEMINI_API_KEY || '';
const groqApiKey = process.env.GROQ_API_KEY || '';

// Initialize Google Gen AI client (used as fallback)
const ai = new GoogleGenAI({ apiKey: geminiApiKey });

/**
 * Reusable helper to execute API calls with exponential backoff and rate-limit parsing.
 */
async function executeWithRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      attempt++;
      
      const isRateLimit = 
        error.status === 429 || 
        (error.message && (
          error.message.includes('429') || 
          error.message.toLowerCase().includes('quota') || 
          error.message.toLowerCase().includes('resource_exhausted') ||
          error.message.toLowerCase().includes('rate_limit')
        ));
      
      if (isRateLimit && attempt < maxRetries) {
        // Base delay of 3 seconds, scaling exponentially
        let delayMs = 3000 * Math.pow(2, attempt - 1);
        
        // Parse "retry in X.XXs" if present in the error message
        if (error.message) {
          const match = error.message.match(/retry in ([\d\.]+)s/i);
          if (match) {
            delayMs = (parseFloat(match[1]) + 1.5) * 1000;
          }
        }
        
        console.warn(`[AI Client] Rate limit (429) encountered. Retrying in ${(delayMs / 1000).toFixed(1)}s... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max rate-limit retries exceeded');
}

/**
 * Generate text using either Groq (primary) or Gemini (fallback).
 */
export async function generateText(
  prompt: string,
  systemInstruction?: string,
  model = 'gemini-2.5-flash'
): Promise<string> {
  return executeWithRetry(async () => {
    // 1. If Groq API Key is available, use Groq (Llama 3)
    if (groqApiKey) {
      try {
        const groqModel = model.includes('pro') ? 'llama-3.3-70b-versatile' : 'llama-3.1-8b-instant';
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: prompt });

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: groqModel,
            messages,
            temperature: 0.7
          })
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Groq API Error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        return data.choices[0]?.message?.content || '';
      } catch (groqError) {
        console.error('[Groq] Text generation failed, falling back to Gemini:', groqError);
      }
    }

    // 2. Fallback to Gemini
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return response.text || '';
    } catch (error) {
      console.error('[Gemini] Text generation failed:', error);
      throw error;
    }
  });
}

/**
 * Generate JSON using either Groq (primary) or Gemini (fallback).
 */
export async function generateJSON<T>(
  prompt: string,
  responseSchema: any,
  systemInstruction?: string,
  model = 'gemini-2.5-flash'
): Promise<T> {
  return executeWithRetry(async () => {
    // 1. If Groq API Key is available, use Groq (Llama 3.3 70B)
    if (groqApiKey) {
      try {
        const groqModel = 'llama-3.3-70b-versatile';
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ 
          role: 'user', 
          content: `${prompt}\n\nCRITICAL REQUIREMENT: You must respond with a JSON object matching this JSON Schema definition:\n${JSON.stringify(responseSchema, null, 2)}\n\nEnsure all keys defined in the schema are present and spelled exactly as written. Do not wrap the JSON output in markdown blocks.` 
        });

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify({
            model: groqModel,
            messages,
            temperature: 0.2,
            response_format: { type: 'json_object' }
          })
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Groq API Error: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        const text = data.choices[0]?.message?.content || '{}';
        
        let cleanText = text.trim();
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        
        return JSON.parse(cleanText) as T;
      } catch (groqError) {
        console.error('[Groq] JSON generation failed, falling back to Gemini:', groqError);
      }
    }

    // 2. Fallback to Gemini
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema,
        },
      });

      const text = response.text || '{}';
      return JSON.parse(text) as T;
    } catch (error) {
      console.error('[Gemini] JSON generation failed:', error);
      throw error;
    }
  });
}
