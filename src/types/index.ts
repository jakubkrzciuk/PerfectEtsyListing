// ============================================
// TYPES - Lale Studio Etsy Generator
// ============================================

export type Shop = 'LaleStudio' | 'Laleshopniki';
export type MountingType = 'Bambus' | 'Oak Natural' | 'Pine Natural' | 'Pine Walnut';
export type ProductType = 'Standardowy Gobelin' | "A'la Makrama";
export type GenerationMode = 'replace' | 'empty_mockup';
export type VideoMode = 'slideshow' | 'collage';

export interface SizeVariant {
  width: string;
  height: string;
}

export interface SimilarProduct {
  url: string;
  label: string;
}

export interface FormData {
  images: string[];
  shop: Shop;
  mounting: MountingType;
  name: string;
  type: ProductType;
  widthCm: string;
  heightCm: string;
  material: string;
  colors: string;
  additionalSizes: SizeVariant[];
  similarLinks: SimilarProduct[];
  userHints: string;
}

export interface TitleSegments {
  hooks: string;
  features: string;
  vibe: string;
  name: string;
}

export interface GeneratedContent {
  title: string;
  titleSegments?: TitleSegments;
  tags: string[];
  altText: string;
  colors: string[];
  description: string;
  marketAnalysis: string;
  keywordStrategy: string;
  visualStyle: string;
  visualDescription: string;
  photoScore: number;
  photoType: string;
  photoCritique: string;
  photoSuggestions: string[];
  seoScore?: number;
}

export interface PlatformStatus {
  etsyLale: boolean;
  etsyShopniki: boolean;
  shopify: boolean;
  wescover: boolean;
}

export interface HistoryItem {
  id: string;
  date: string;
  thumbnails: string[];
  title: string;
  tags: string[];
  name: string;
  colors?: string[];
  platforms: PlatformStatus;
  description?: string;
  marketAnalysis?: string;
  keywordStrategy?: string;
  visualStyle?: string;
  visualDescription?: string;
  photoScore?: number;
  photoType?: string;
  photoCritique?: string;
  photoSuggestions?: string[];
}

export interface SeoAnalysis {
  score: number;
  checks: {
    titleLength: boolean;
    descLength: boolean;
    tagCount: boolean;
    nameAtEnd: boolean;
    keywordStart: boolean;
    uniqueTags: boolean;
  };
  duplicates: string[];
}

export interface ProcessedImage {
  data: string;
  mimeType: string;
}

// Window extensions for AI Studio
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
