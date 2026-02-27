// ============================================
// SEO ANALYSIS UTILS
// ============================================

import type { SeoAnalysis, GeneratedContent } from '../types';
import { SEO_REQUIREMENTS } from '../config/constants';

/**
 * Analyze listing for Etsy SEO compliance
 */
export const analyzeSeo = (
  result: GeneratedContent,
  productName: string,
  powerKeywords: string[]
): SeoAnalysis => {
  const title = result.title?.trim() || '';
  const desc = result.description?.trim() || '';
  const tags = result.tags || [];
  const name = productName.trim().toLowerCase();
  
  // 1. Basic Length Checks
  const titleLengthOk = title.length >= SEO_REQUIREMENTS.TITLE_MIN_LENGTH && 
                        title.length <= SEO_REQUIREMENTS.TITLE_MAX_LENGTH;
  const descLengthOk = desc.length >= SEO_REQUIREMENTS.DESC_MIN_LENGTH;
  const tagCountOk = tags.length === SEO_REQUIREMENTS.TAGS_COUNT;
  const nameAtEndOk = title.toLowerCase().endsWith(name);
  
  // 2. Keyword Start Check (Critical for Mobile)
  const words = title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const first4Words = words.slice(0, 4);
  let strongWordsCount = 0;
  first4Words.forEach(word => {
    const isPower = powerKeywords.some(pk => pk.toLowerCase().includes(word));
    if (isPower) strongWordsCount++;
  });
  const keywordStartOk = strongWordsCount >= 2;

  // 3. Variety Check (Anti-Repetition)
  const wordCounts: Record<string, number> = {};
  const repeatedKeywords: string[] = [];
  words.forEach(word => {
    // Ignore common stop words
    if (['and', 'the', 'with', 'for', 'from'].includes(word)) return;
    wordCounts[word] = (wordCounts[word] || 0) + 1;
    if (wordCounts[word] > SEO_REQUIREMENTS.MAX_KEYWORD_REPETITION && !repeatedKeywords.includes(word)) {
      repeatedKeywords.push(word);
    }
  });
  const varietyOk = repeatedKeywords.length === 0;

  // 4. Punctuation & Spam Check
  const excessivePunctuation = (title.match(/[!?,;:]{2,}/g) || []).length > 0;
  const tooManyCaps = (title.match(/[A-Z]{4,}/g) || []).length > 0;
  const punctuationOk = !excessivePunctuation && !tooManyCaps;
  
  // 5. Duplicate Tags in Title Check
  const duplicates: string[] = [];
  tags.forEach(tag => {
    if (tag.length > 3 && title.toLowerCase().includes(tag.toLowerCase())) {
      duplicates.push(tag);
    }
  });
  const uniqueTagsOk = duplicates.length <= SEO_REQUIREMENTS.MAX_DUPLICATE_TAGS;
  
  // Calculate score (out of 100)
  let score = 0;
  if (titleLengthOk) score += 20;
  if (descLengthOk) score += 15;
  if (tagCountOk) score += 15;
  if (nameAtEndOk) score += 5;
  if (keywordStartOk) score += 15;
  if (varietyOk) score += 15;
  if (punctuationOk) score += 5;
  if (uniqueTagsOk) score += 10;
  
  return {
    score: Math.max(0, Math.min(100, score)),
    checks: {
      titleLength: titleLengthOk,
      descLength: descLengthOk,
      tagCount: tagCountOk,
      nameAtEnd: nameAtEndOk,
      keywordStart: keywordStartOk,
      uniqueTags: uniqueTagsOk,
      variety: varietyOk,
      punctuation: punctuationOk
    },
    duplicates,
    repeatedKeywords
  };
};

/**
 * Format sizes for listing description
 */
export const formatSizesBlock = (
  mainWidth: string,
  mainHeight: string,
  additionalSizes: { width: string; height: string }[]
): string => {
  const allSizes = [
    { width: mainWidth, height: mainHeight },
    ...additionalSizes
  ];
  
  // Remove duplicates
  const uniqueSizes = allSizes.filter((value, index, self) => 
    index === self.findIndex((t) => t.width === value.width && t.height === value.height)
  );
  
  const squares: string[] = [];
  const rectangles: string[] = [];
  
  uniqueSizes.forEach(s => {
    const w = parseInt(s.width);
    const h = parseInt(s.height);
    const wIn = Math.round(w / 2.54);
    const hIn = Math.round(h / 2.54);
    const line = `${hIn} x ${wIn} inches (${h} x ${w} cm)`;
    
    if (w === h) {
      squares.push(line);
    } else {
      rectangles.push(line);
    }
  });
  
  let result = '';
  if (rectangles.length > 0) {
    result += `Rectangular Sizes:\n${rectangles.join('\n')}\n`;
  }
  if (squares.length > 0) {
    if (result) result += '\n';
    result += `Square Sizes:\n${squares.join('\n')}`;
  }
  
  if (!result) {
    const w = parseInt(mainWidth);
    const h = parseInt(mainHeight);
    result = `${Math.round(h/2.54)} x ${Math.round(w/2.54)} inches (${h} x ${w} cm)`;
  }
  
  return result;
};

/**
 * Format similar products links
 */
export const formatLinksBlock = (links: { url: string; label: string }[]): string => {
  if (links.length === 0) {
    return 'Check out my other designs in the shop!';
  }
  return links.map(l => `${l.url}\n${l.label}`).join('\n\n');
};

/**
 * Get random keywords for variety
 */
export const getRandomKeywords = (keywords: string[], count: number): string[] => {
  if (keywords.length === 0) return [];
  const shuffled = [...keywords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
