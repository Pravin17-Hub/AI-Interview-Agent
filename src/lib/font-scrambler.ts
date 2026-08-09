'use client';

// Define the character set to scramble (only alphanumeric to keep layout punctuation and spacing intact)
const ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export interface FontMapping {
  fontFamily: string;
  // Visual character -> Scrambled character (what to write in DOM to show visual)
  encodeMap: { [key: string]: string };
  // Scrambled character -> Visual character
  decodeMap: { [key: string]: string };
}

// Generate a random permutation of alphanumeric characters
function getShuffledString(): string {
  const arr = ALPHANUM.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

/**
 * Loads opentype.js dynamically and generates a custom scrambled font binary.
 * Registers the font dynamically in the document.
 */
export async function initializeScrambledFont(fontId: string): Promise<FontMapping> {
  // Ensure we are in browser
  if (typeof window === 'undefined') {
    return { fontFamily: 'sans-serif', encodeMap: {}, decodeMap: {} };
  }

  // Load opentype.js if not already present
  if (!(window as any).opentype) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (e) => reject(new Error('Failed to load opentype.js library'));
      document.body.appendChild(script);
    });
  }

  const opentype = (window as any).opentype;
  if (!opentype) {
    throw new Error('opentype.js is not loaded');
  }

  // Fetch the source font file
  const fontRes = await fetch('/fonts/noto-sans.ttf');
  if (!fontRes.ok) {
    throw new Error('Failed to fetch source font file Noto Sans');
  }
  const arrayBuffer = await fontRes.arrayBuffer();
  
  // Parse font
  const font = opentype.parse(arrayBuffer);

  // Generate scrambled map
  const shuffled = getShuffledString();
  
  const encodeMap: { [key: string]: string } = {};
  const decodeMap: { [key: string]: string } = {};

  for (let i = 0; i < ALPHANUM.length; i++) {
    const visualChar = ALPHANUM[i];
    const scrambledChar = shuffled[i];
    encodeMap[visualChar] = scrambledChar;
    decodeMap[scrambledChar] = visualChar;
  }

  // Swap glyph unicodes in the font
  const targetGlyphs = ALPHANUM.split("").map(c => font.charToGlyph(c));

  // Clear mappings first to prevent collision errors
  targetGlyphs.forEach(g => {
    g.unicode = -1;
    g.unicodes = [];
  });

  // Set scrambled unicodes
  targetGlyphs.forEach((glyph, idx) => {
    const sourceChar = shuffled[idx]; // the character in the HTML
    const code = sourceChar.charCodeAt(0);
    glyph.unicode = code;
    glyph.unicodes = [code];
  });

  // Re-compile font
  const scrambledBuffer = font.toArrayBuffer();
  const blob = new Blob([scrambledBuffer], { type: 'font/ttf' });
  const fontUrl = URL.createObjectURL(blob);

  // Load via FontFace API
  const fontFamilyName = `scrambled-${fontId}`;
  const fontFace = new FontFace(fontFamilyName, `url(${fontUrl})`);
  
  await fontFace.load();
  document.fonts.add(fontFace);

  return {
    fontFamily: fontFamilyName,
    encodeMap,
    decodeMap
  };
}

/**
 * Encodes clean text into scrambled codes so they render correctly with the scrambled font.
 */
export function obfuscateText(text: string, mapping: FontMapping | null): string {
  if (!text) return '';
  if (!mapping || Object.keys(mapping.encodeMap).length === 0) return text;
  return text.split('').map(c => mapping.encodeMap[c] || c).join('');
}

/**
 * Decodes scrambled text back to clean text.
 */
export function deobfuscateText(text: string, mapping: FontMapping | null): string {
  if (!text) return '';
  if (!mapping || Object.keys(mapping.decodeMap).length === 0) return text;
  return text.split('').map(c => mapping.decodeMap[c] || c).join('');
}
