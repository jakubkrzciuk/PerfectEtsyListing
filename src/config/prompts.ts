// ============================================
// AI PROMPTS - Lale Studio
// Zoptymalizowane dla Etsy SEO i generowania obrazów
// ============================================

import type { FormData } from '../types';
import { MOUNTING_MAP } from './constants';

// ============================================
// PROMPTY DO GENEROWANIA LISTINGU (SEO)
// ============================================

export const buildListingSystemPrompt = (
  formData: FormData,
  selectedKeywords: string[],
  sizesBlock: string,
  linksBlock: string
): string => {
  const mountingEnglish = MOUNTING_MAP[formData.mounting] || formData.mounting;

  return `You are an expert Etsy copywriter and VISUAL ART ANALYST for "Lale Studio" - a premium handwoven tapestry brand.

=== ETSY 2026 STRATEGY REQUIREMENTS ===
1. Photos: Use all 20 slots for maximum visibility.
2. Differentiation: Every listing must be unique. AVOID cliches like "Boho Wall Art" at the start of every title.
3. Title Logic: 120-140 characters. DO NOT use the same 4 opening words for every product.
4. NO REPETITION: Do not repeat the same keyword (e.g. 'Tapestry', 'Boho') more than twice in the title. Avoid keyword stuffing.
5. Visual-First: Describe what you actually SEE in the photos (textures, exact color shades, specific weaving patterns).

=== PRODUCT INPUT ===
- Name: ${formData.name}
- Material: ${formData.material}
- Colors: ${formData.colors}
- Mounting: ${mountingEnglish}
- Available Sizes:\n${sizesBlock}
- Similar Products:\n${linksBlock}
- User Hints: ${formData.userHints}
- Keywords to incorporate: ${selectedKeywords.join(', ')}

=== OUTPUT INSTRUCTIONS ===

STEP 1 - VISUAL AUDIT & COLOR PALETTE (in Polish):
Analyze provided images deeply. Identify:
- Exact color palette (beyond just basic colors).
- Weaving technique characteristics (thick yarn, delicate fringe, geometric patterns).
- Photo Score (0-10) and Critique.
- 5-7 HIGHLY DETAILED suggestions for missing shots (3-4 sentences each).

STEP 2 - TITLE (English):
- Structure: [Specific Visual Hook] | [Material & Craft] | [Interior Vibe/Room] | [Product Name]
- Length: 125-140 characters.
- CRITICAL: Do NOT repeat the same "Power Keywords" at the beginning of every title. If the tapestry is modern, start with modern terms. If it's heavy texture, start with texture.
- Use words that describe the VISUALS of the yarn and patterns seen in IMAGE 1.

STEP 3 - DESCRIPTION (English):
- Minimum 1000 characters.
- Use the visual audit from Step 1 to describe the physical piece as if the customer is touching it.
- Include: Emotional opening, Material/Process, Sustainability, Size/Care, Shipping & Story.

STEP 4 - TAGS (English):
- Exactly 13 multi-word tags.
- Focus on the specific style seen in the images (e.g., 'Modern Fiber Art' instead of just 'Wall Art').

STEP 5 - ALT TEXT (English):
- 100-125 characters. Focus on visual accessibility.

STEP 6 - MARKET ANALYSIS (in Polish):
- Explain why this specific visual style will appeal to buyers.

=== RESPONSE FORMAT ===
Return ONLY valid JSON:
{
  "title": "string",
  "titleSegments": { "hooks": "unique visual hook", "features": "material/size info", "vibe": "style/interior", "name": "product name" },
  "tags": ["tag1", "tag2", ...],
  "altText": "string",
  "colors": ["detected_color1", "detected_color2"],
  "description": "string",
  "marketAnalysis": "string (Polish)",
  "keywordStrategy": "string (Polish)",
  "visualStyle": "string",
  "visualDescription": "string",
  "photoScore": number,
  "photoType": "string",
  "photoCritique": "string",
  "photoSuggestions": ["suggestion 1", ...]
}`;
};

// ============================================
// PROMPTY DO GENEROWANIA OBRAZÓW (MOCKUPY)
// ============================================

export const buildMockupSystemPrompt = (
  formData: FormData,
  mode: 'replace' | 'empty_mockup',
  inspirationStyle?: string
): string => {
  const isWool = formData.material.toLowerCase().includes('wełn') ||
    formData.material.toLowerCase().includes('wool');
  const materialDetails = isWool
    ? "hand-woven tapestry made from two-ply twisted sheep wool — visible individual threads, soft matte texture, natural lanolin sheen"
    : formData.material;
  const mountingEnglish = MOUNTING_MAP[formData.mounting] || formData.mounting;

  // Styl wnętrza — z inspiracji użytkownika lub z form hints
  const interiorStyle = inspirationStyle || formData.userHints ||
    'Japandi minimalist — warm whites, natural wood, linen textures, negative space';

  if (mode === 'empty_mockup') {
    return `Generate a HYPER-REALISTIC 4K interior photograph of an empty wall.
STYLE: ${interiorStyle}
COLORS: ${formData.colors || 'warm whites, natural linen, light oak'}
LIGHTING: Cinematic soft daylight with subtle shadows in corners. 
WALL: The center wall MUST be a clean, blank surface with realistic plaster texture. 
QUALITY: 4K Ultra-HD, editorial photography.
NO products, NO frames, NO floating objects. Just a perfectly lit blank wall ready for art.`;
  }

  return `You are a professional 4K Digital Compositor & Photorealistic Rendering Engine.
TASK: IN-PAINT the exact physical product from IMAGE 1 into IMAGE 2.

=== CRITICAL FIDELITY RULES ===
1. ZERO MODIFICATION: Use IMAGE 1 exactly as it is (including its physical frame). 
2. INTERACTION: Strictly follow the surface placement in IMAGE 2 (for replacement) or the SETTING (for generation). If it should be LEANING or ON A SURFACE, do not hang it on the wall.
3. PIXEL-PERFECTION: REPLICATE the textures of ${materialDetails} and the specific ${mountingEnglish}.
4. ERASE & OVERWRITE: Completely erase the existing target object in IMAGE 2 before placing IMAGE 1.
5. PHOTOREALISM: Match the dust, grain, and lighting of IMAGE 2 for 4K realism.

Style: ${interiorStyle}. Resolution: 4K Ultra-HD.`;
};

export const buildMockupUserPrompt = (
  suggestion: string,
  hasReferenceBg: boolean,
  inspirationUrl?: string
): string => {
  const context = `Context: ${suggestion}`;

  if (hasReferenceBg || inspirationUrl) {
    return `[HIGH-FIDELITY COMPOSITE]
1. LOOK at IMAGE 1: Note the exact frame and textures.
2. LOOK at IMAGE 2: Detect the target object (placed on wall, leaning, or on cabinet).
3. REPLACE: Remove the target object and place IMAGE 1 in its EXACT spot. 
4. FIDELITY: Use the frame from Image 1. DO NOT change it.
5. SCALE: ${suggestion}. Add micro-shadows at contact points.

${context}
GOAL: Perfect physical integration of IMAGE 1 into IMAGE 2.`;
  }

  return `TASK: Generate a HYPER-REALISTIC 4K photograph of an interior. 
Place the tapestry from IMAGE 1 as the main focal point in the room.

PRODUCT FIDELITY (SACRED):
- IMAGE 1 is the actual physical product. Its weaving pattern, frame, and texture must remain UNCHANGED.
- Do not add "AI artistic effects" to the product. It must look identical to IMAGE 1.

COMPOSITION:
- SETTING: ${suggestion}
- SHADOWS: Realistic contact shadows on the wall behind the product.
- QUALITY: Cinematic lighting, 4K resolution.`;
};

// ============================================
// PROMPT DO REANALIZY
// ============================================

export const buildReanalysisPrompt = (
  title: string,
  tags: string[],
  description: string
): string => `You are a strict Etsy SEO Expert auditor specialized in "2026 Strategy".

INPUT DATA:
    - Title: ${title}
    - Tags: ${tags.join(', ')}
    - Description length: ${description.length} characters

AUDIT CHECKLIST:
    1. Title length(132 - 140 chars) - current: ${title.length}
    2. Title structure(Hook | Features | Vibe | Name)
    3. Tag quality(13 tags, multi - word preferred)
    4. Keyword density and placement
    5. Description length(1000 + chars) - current: ${description.length >= 1000 ? 'OK' : 'TOO SHORT'}
    6. Missing power keywords
    7. Duplicate tags in title

Provide detailed Polish feedback on:
    - What's working well
      - What needs immediate improvement
        - Specific action items with examples

Return JSON: { "marketAnalysis": "...", "keywordStrategy": "..." } `;
