// ============================================
// CONSTANTS - Lale Studio
// ============================================

export const PRESETS = [
  { w: '45', h: '75', label: 'Mały (45x75)' },
  { w: '60', h: '100', label: 'Średni (60x100)' },
  { w: '80', h: '120', label: 'Duży (80x120)' },
  { w: '60', h: '60', label: 'Kwadrat S (60x60)' },
  { w: '80', h: '80', label: 'Kwadrat M (80x80)' },
  { w: '100', h: '100', label: 'Kwadrat L (100x100)' },
] as const;

export const DEFAULT_KEYWORDS: string[] = [
  "Art", "Bedroom Decor", "Black and White Art",
  "Boho", "Boho Art", "Boho Decor", "Boho Wall Art",
  "Canvas Art", "Cozy Gifts", "Cream", "Custom",
  "Fiber Art", "Hand Dyed Yarn", "Handmade Gift", "Handwoven Tapestry",
  "Home Decor", "Housewarming Gift", "Hygge",
  "Japandi Wall Art", "Japanese Wall Art", "Large Wall Art",
  "Living Room Decor", "Macrame", "Modern Heritage",
  "Minimalist Art", "Modern Art", "New Home Gift",
  "Office Decor", "Original Artwork", "Retro Wall Art",
  "Sculptural Wall Art", "Tapestry", "Textile Art", "Textile Wall Art",
  "Unique Wall Art", "Vertical Wall Art", "Wabi Sabi", "Wabi Sabi Wall Art",
  "Wall Art", "Wall Decor", "Wall Hanging", "Wall Sculpture",
  "Wood Wall Art", "Woven Wall Art", "Woven Wall Hanging"
];

export const MOUNTING_MAP: Record<string, string> = {
  'Bambus': 'Natural Bamboo Rod',
  'Oak Natural': 'Solid Oak Wood Frame',
  'Pine Natural': 'Solid Pine Wood Frame',
  'Pine Walnut': 'Walnut Stained Pine Frame'
} as const;

// ============================================
// AI MODELS - Aktualne modele Google (2025)
// ============================================

export const AI_MODELS = {
  // Tekst i analiza - szybki i tani
  TEXT: 'gemini-2.0-flash',
  
  // Generowanie obrazów - eksperymentalny model z generowaniem
  IMAGE_GENERATION: 'gemini-2.0-flash-exp-image-generation',
  
  // Fallback dla obrazów gdy główny przeciążony
  IMAGE_FALLBACK: 'gemini-2.0-flash',
  
  // Zaawansowana analiza - jeśli potrzebna głębsza
  PRO_ANALYSIS: 'gemini-2.0-pro-exp-02-05'
} as const;

// ============================================
// IMAGE PROCESSING CONFIG
// ============================================

export const IMAGE_CONFIG = {
  // Max rozmiar do AI - zmniejszone dla optymalizacji kosztów
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  
  // Jakość kompresji JPEG
  JPEG_QUALITY: 0.85,
  
  // Max zdjęć wysyłanych do AI na raz (optymalizacja payloadu)
  MAX_AI_IMAGES: 5,
  
  // Max wszystkich zdjęć produktu
  MAX_PRODUCT_IMAGES: 20,
  
  // Aspect ratio dla generowanych mockupów
  MOCKUP_ASPECT_RATIO: '4:3' as const
} as const;

// ============================================
// RETRY CONFIG
// ============================================

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 2000,
  BACKOFF_MULTIPLIER: 2
} as const;

// ============================================
// SEO REQUIREMENTS
// ============================================

export const SEO_REQUIREMENTS = {
  TITLE_MIN_LENGTH: 132,
  TITLE_MAX_LENGTH: 140,
  DESC_MIN_LENGTH: 1000,
  TAGS_COUNT: 13,
  MAX_DUPLICATE_TAGS: 3
} as const;
