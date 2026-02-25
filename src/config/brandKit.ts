// ============================================
// LALE BRAND KIT - Visual Identity Tokens
// ============================================

export const LALE_COLORS = {
    primary: '#1c1917', // Stone 900
    secondary: '#f5f5f4', // Stone 100
    accent: '#f43f5e', // Rose 500
    gold: '#d97706', // Amber 600
    background: {
        linen: '#fdfcfb',
        clay: '#f7f3f0',
        paper: '#faf9f6'
    },
    palette: [
        '#1c1917', '#44403c', '#78716c', '#a8a29e',
        '#d6d3d1', '#f5f5f4', '#fdfcfb', '#f43f5e',
        '#d97706', '#10b981', '#3b82f6'
    ]
};

export const LALE_FONTS = [
    { id: 'serif', name: 'Cormorant Garamond', family: "'Cormorant Garamond', serif", weights: [400, 500, 600] },
    { id: 'sans', name: 'Inter', family: "'Inter', sans-serif", weights: [300, 400, 500] },
    { id: 'accent', name: 'Noto Serif', family: "'Noto Serif', serif", weights: [400, 700] }
];

export const LALE_TEXTURES = [
    { id: 'linen', name: 'Lniana Tekstura', url: '/textures/linen.png' },
    { id: 'paper', name: 'Papier Japoński', url: '/textures/paper.png' }
];

export const LALE_LOGO = {
    minimal: `<svg width="100" height="40" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-weight="600" font-size="28" letter-spacing="4">LALE</text></svg>`,
    brand: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="0.5"/><text x="50" y="55" dominant-baseline="middle" text-anchor="middle" font-family="'Cormorant Garamond', serif" font-weight="400" font-size="14" letter-spacing="8">LALE</text></svg>`
};

export const PLATFORM_DIMENSIONS = {
    PINTEREST: { width: 1000, height: 1500, ratio: '2:3' },
    INSTA_STORY: { width: 1080, height: 1920, ratio: '9:16' },
    INSTA_POST: { width: 1080, height: 1080, ratio: '1:1' },
    FB_POST: { width: 1200, height: 630, ratio: '1.91:1' },
    BRAND_FOCUS: { width: 1080, height: 1350, ratio: '4:5' }
};
