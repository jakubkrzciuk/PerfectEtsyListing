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
  mode: 'replace' | 'empty_mockup'
): string => {
  const isWool = formData.material.toLowerCase().includes('wełn') || 
                 formData.material.toLowerCase().includes('wool');
  const materialDetails = isWool 
    ? "two-ply twisted sheep wool (wełna owcza skręcana dwuniciowa)"
    : formData.material;
  const mountingEnglish = MOUNTING_MAP[formData.mounting] || formData.mounting;

  if (mode === 'empty_mockup') {
    return `Generate a hyper-realistic interior design photograph of an empty wall ready for product placement.

REQUIREMENTS:
- Setting: Premium interior with ${formData.colors || 'neutral warm tones'}
- Style: ${formData.userHints || 'Modern Heritage, Japandi, Biophilic aesthetic'}
- Lighting: Cinematic, soft natural daylight from side window, volumetric depth
- Wall: Center area must be empty, clean, well-lit for product photoshopping
- Atmosphere: Cozy, premium, Architectural Digest quality
- NO floating objects, NO frames in center area
- 8k resolution, photorealistic`;
  }

  return `You are a specialized vision and generative AI. Your task is to flawlessly composite a handwoven tapestry into a new interior setting.

=== PRODUCT ANALYSIS (Preserve these exact characteristics) ===
- Material: ${materialDetails}
- Weave Structure: Vertical and horizontal threads, yarn thickness and fluffiness
- Painting Technique: Brush-applied paint on finished fabric (visible brush strokes, incomplete coverage in weave crevices, artistic abrasions)
- Frame: ${mountingEnglish} - 1cm front width, 5cm depth
- Weight/Drape: Physical "heaviness" of wool, natural sag when hung
- Finishing: Natural materials only (wood, cotton strings)

=== CRITICAL RULES ===
1. ABSOLUTELY preserve the exact texture from reference - NO smooth AI look
2. Must look like hand-woven, hand-painted tapestry
3. Add realistic 5cm depth shadow from frame
4. Maintain natural fabric physics (drape, fold, gravity)
5. Use only natural lighting that would exist in the described setting
6. Photorealistic 8k quality

=== TASK ===
Composite the provided tapestry into the requested setting while following ALL rules above. The result must look like a professional interior photography shot, not an AI generation.`;
};

export const buildMockupUserPrompt = (
  suggestion: string,
  hasReferenceBg: boolean
): string => {
  if (hasReferenceBg) {
    return `TASK: Image 1 is the product (wall hanging tapestry). Image 2 is the target background/interior. 
    
Seamlessly composite Image 1 into Image 2. The tapestry should look naturally hung on the wall in Image 2, with proper lighting matching the scene, realistic shadows, and preserved texture.

Setting details: ${suggestion}`;
  }

  return `TASK: Place this handwoven tapestry in the following setting:

${suggestion}

The final image should look like a hyper-realistic, high-end interior design photograph. Preserve all texture details of the original tapestry.`;
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
