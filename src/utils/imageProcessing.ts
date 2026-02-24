// ============================================
// IMAGE PROCESSING UTILS
// Optymalizacja obrazów dla AI
// ============================================

import type { ProcessedImage } from '../types';
import { IMAGE_CONFIG } from '../config/constants';

/**
 * Resize and compress image for AI processing
 * Reduces payload size while maintaining quality
 */
export const resizeImage = (
  base64Str: string, 
  maxWidth: number = IMAGE_CONFIG.MAX_WIDTH
): Promise<ProcessedImage> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions maintaining aspect ratio
      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      
      // Also check height constraint
      if (height > IMAGE_CONFIG.MAX_HEIGHT) {
        width *= IMAGE_CONFIG.MAX_HEIGHT / height;
        height = IMAGE_CONFIG.MAX_HEIGHT;
      }
      
      canvas.width = Math.round(width);
      canvas.height = Math.round(height);
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Use better quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with configured quality
        const newDataUrl = canvas.toDataURL('image/jpeg', IMAGE_CONFIG.JPEG_QUALITY);
        resolve({
          data: newDataUrl.split(',')[1],
          mimeType: 'image/jpeg'
        });
      } else {
        // Fallback to original
        resolve(extractBase64Data(base64Str));
      }
    };
    
    img.onerror = () => {
      resolve(extractBase64Data(base64Str));
    };
  });
};

/**
 * Extract base64 data from data URL
 */
const extractBase64Data = (base64Str: string): ProcessedImage => ({
  data: base64Str.split(',')[1],
  mimeType: base64Str.split(';')[0].split(':')[1]
});

/**
 * Process multiple images with batching and progress tracking
 * Limits number of images sent to AI to reduce costs
 */
export const processImagesForAI = async (
  images: string[],
  onProgress?: (processed: number, total: number) => void
): Promise<ProcessedImage[]> => {
  // Select best images (first ones usually are main product shots)
  const imagesToProcess = images.slice(0, IMAGE_CONFIG.MAX_AI_IMAGES);
  
  const processed: ProcessedImage[] = [];
  
  for (let i = 0; i < imagesToProcess.length; i++) {
    const img = await resizeImage(imagesToProcess[i]);
    processed.push(img);
    onProgress?.(i + 1, imagesToProcess.length);
  }
  
  return processed;
};

/**
 * Calculate optimal images to send to AI
 * Prioritizes diversity (first, middle, last from set)
 */
export const selectImagesForAI = (images: string[]): string[] => {
  if (images.length <= IMAGE_CONFIG.MAX_AI_IMAGES) {
    return images;
  }
  
  const selected: string[] = [];
  const step = Math.floor(images.length / IMAGE_CONFIG.MAX_AI_IMAGES);
  
  for (let i = 0; i < IMAGE_CONFIG.MAX_AI_IMAGES; i++) {
    const index = Math.min(i * step, images.length - 1);
    selected.push(images[index]);
  }
  
  return selected;
};

/**
 * Convert base64 to file for download
 */
export const base64ToFile = (base64: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'Plik musi być obrazem' };
  }
  
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'Obraz jest za duży (max 10MB)' };
  }
  
  return { valid: true };
};
