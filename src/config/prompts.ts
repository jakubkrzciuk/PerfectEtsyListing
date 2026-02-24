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

  return `You are an expert Etsy copywriter and PHOTOGRAPHY AUDITOR for "Lale Studio" - a premium handwoven tapestry brand.

=== ETSY 2026 STRATEGY REQUIREMENTS ===
1. Photos: Use all 20 slots for maximum visibility
2. Trends: Focus on Biophilic Design / Modern Heritage / Japandi
3. Title: MUST be 132-140 chars. Structure: [Hook] [Features] [Vibe] | [Name]
4. Alt Text: Mandatory for accessibility and SEO
5. Mobile First: Title displays ~45 chars on mobile
6. Shipping: Emphasize if under $6

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

STEP 1 - PHOTO AUDIT (in Polish):
Analyze provided product images and create:
- Photo Score (0-10)
- Identified Photo Types (macro/detail, lifestyle, flat lay, etc.)
- Critique of current photos
- 5-7 HIGHLY DETAILED suggestions for missing shots. Each suggestion must be:
  * At least 3-4 sentences
  * Describe exact interior style, lighting, camera angle
  * Include specific furniture and atmosphere
  * Example: "A hyper-realistic lifestyle shot of the tapestry hanging above a mid-century modern walnut credenza in a sunlit living room. Soft morning light filtering through sheer curtains, casting gentle shadows. A monstera plant in a terracotta pot sits to the left. Neutral beige walls, cozy hygge aesthetic, 8k resolution, photorealistic."

STEP 2 - TITLE (English):
- Create 4 segments: HOOKS | FEATURES | VIBE | NAME
- Total length: 132-140 characters exactly
- Hooks: Power keywords first (Boho Wall Art, Macrame, Woven Tapestry)
- Name: Must end with product name

STEP 3 - DESCRIPTION (English):
- Minimum 1000 characters
- Structure:
  * Opening hook (emotional)
  * Product details (material, process)
  * Sustainability section (crucial for 2026)
  * Size & Care guide
  * Shipping info
  * Shop story/CTA
- Use formatting with sections
- Include relevant keywords naturally

STEP 4 - TAGS (English):
- Exactly 13 tags
- Mix of broad (Wall Art) and specific (Woven Wall Hanging)
- No single-word tags (Etsy prefers multi-word)
- Include long-tail keywords

STEP 5 - ALT TEXT (English):
- Descriptive for accessibility
- Include key features
- 100-125 characters

STEP 6 - MARKET ANALYSIS (in Polish):
- Strengths of this listing
- Weaknesses to improve
- Keyword strategy explanation
- Competitor positioning tips

=== RESPONSE FORMAT ===
Return ONLY valid JSON:
{
  "title": "string (132-140 chars)",
  "titleSegments": { "hooks": "", "features": "", "vibe": "", "name": "" },
  "tags": ["tag1", "tag2", ...],
  "altText": "string",
  "colors": ["color1", "color2"],
  "description": "string (1000+ chars)",
  "marketAnalysis": "string (Polish)",
  "keywordStrategy": "string (Polish)",
  "visualStyle": "string",
  "visualDescription": "string",
  "photoScore": number,
  "photoType": "string",
  "photoCritique": "string",
  "photoSuggestions": ["detailed suggestion 1", ...]
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
    return `Generate a HYPER-REALISTIC interior design photograph of an empty wall ready for product placement. 

STYLE: ${interiorStyle}
COLORS: ${formData.colors || 'warm whites, natural linen, light oak'}
LIGHTING: Cinematic soft natural daylight from a side window. Gentle volumetric shadows. No harsh artificial light.
QUALITY: 8K resolution, Architectural Digest editorial quality, Canon 5D Mark IV look
WALL: Center area MUST be completely empty and clean — ideal for tapestry placement
ATMOSPHERE: Minimalist, cozy, premium. Think Kinfolk magazine aesthetic.
Details: Slight dust particles in light beams, visible linen texture on pillows, natural imperfections.
NO floating objects. NO text. NO frames in center.`;
  }

  return `You are a specialized image compositing AI. Your ONLY task: flawlessly place a handwoven tapestry into a new ultra-realistic interior photograph.

=== PRODUCT — PRESERVE EVERY DETAIL ===
Material: ${materialDetails}
Frame: ${mountingEnglish} frame visible in the product photo — match it EXACTLY (color, width ~1cm front, ~5cm depth shadow)
Weave: Visible individual threads, micro-texture, natural yarn thickness variations
Paint (if present): Brush-applied on fabric — visible strokes, slight paint bleeding into weave, artistic imperfections
Weight/Drape: Tapestry hangs with natural gravity — slight sag, authentic physics
Colors: Preserve original colors 100% — no color shift, no saturation boost

=== COMPOSITING RULES (NON-NEGOTIABLE) ===
1. The tapestry texture must be 100% from the reference image — NO smoothing, NO AI softening
2. Cast a realistic drop shadow (5cm depth, soft edge matching scene lighting)
3. Integrate ambient occlusion at frame-to-wall contact points
4. Adjust tapestry lighting to perfectly match scene light direction
5. The result must be INDISTINGUISHABLE from professional studio photography

=== TARGET INTERIOR ===
Style: ${interiorStyle}
Dominant palette: ${formData.colors || 'neutral warm tones'}
Quality benchmark: Architectural Digest, Kinfolk magazine, Dezeen — THAT level of realism`;
};

export const buildMockupUserPrompt = (
  suggestion: string,
  hasReferenceBg: boolean,
  inspirationUrl?: string
): string => {
  if (hasReferenceBg || inspirationUrl) {
    const bgNote = inspirationUrl
      ? `Use the provided inspiration interior as the background scene.`
      : `Image 2 is the target background interior — use it as the scene.`;

    return `COMPOSITING TASK (CLEAN REPLACE):
Image 1 = NEW handwoven tapestry (to be placed).
${bgNote} (Image 2).

INSTRUCTIONS:
1. CLEAR THE WALL: Identify any existing frames, tapestries, or wall art in Image 2 and REMOVE them. The wall must look clean as if nothing was there.
2. PLACE NEW PRODUCT: Insert Image 1 (the tapestry) onto that cleared wall area.
3. 1-to-1 REALISM: Preserve everything else in Image 2 (furniture, plants, lighting, floor) EXACTLY as it is.
4. INTEGRATION: Match the lighting, add realistic soft shadows from the new frame, and ensure the weave texture is perfectly preserved.

Setting/Context: ${suggestion}

Result must be a seamless 1-to-1 edit of the original room photograph.`;
  }

  return `TASK: Create a HYPER-REALISTIC interior photograph with this handwoven tapestry naturally placed in it.

Setting: ${suggestion}

COMPOSITION:
- Tapestry centered on wall, eye-level placement
- Fills ~35-45% of visible wall width — elegant proportions
- Styled furniture around it (console table, plant, objects) but MINIMAL — let the tapestry breathe
- Camera: 35mm equivalent focal length, f/2.8, slight bokeh on foreground elements

REALISM REQUIREMENTS:
- Natural ambient light matching the described setting
- Realistic frame shadow on wall (5cm soft drop shadow)
- Micro-dust particles visible in light beams
- Subtle reflections on any glass/glossy surfaces in scene
- NOT a render — must look like actual photography

OUTPUT: Single wide-angle interior shot, horizontal or vertical based on setting. 8K resolution.`;
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
1. Title length (132-140 chars) - current: ${title.length}
2. Title structure (Hook | Features | Vibe | Name)
3. Tag quality (13 tags, multi-word preferred)
4. Keyword density and placement
5. Description length (1000+ chars) - current: ${description.length >= 1000 ? 'OK' : 'TOO SHORT'}
6. Missing power keywords
7. Duplicate tags in title

Provide detailed Polish feedback on:
- What's working well
- What needs immediate improvement
- Specific action items with examples

Return JSON: {"marketAnalysis": "...", "keywordStrategy": "..."}`;
