// ============================================
// SOCIAL DATABASE HOOK
// Persistence for Social Media Drafts
// ============================================

import { useState, useEffect, useCallback } from 'react';

export interface SocialPost {
    id: string;
    platform: string;
    caption: string;
    hashtags: string;
    imageUrl: string;
    date: string;
}

export const useSocialDatabase = () => {
    const [posts, setPosts] = useState<SocialPost[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('lale_social_posts');
        if (saved) {
            try {
                setPosts(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse social posts', e);
            }
        }
        setLoading(false);
    }, []);

    const savePost = useCallback(async (post: Omit<SocialPost, 'id' | 'date'>) => {
        const newPost: SocialPost = {
            ...post,
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('pl-PL')
        };

        setPosts(prev => {
            const next = [newPost, ...prev];
            localStorage.setItem('lale_social_posts', JSON.stringify(next));
            return next;
        });
    }, []);

    const removePost = useCallback((id: string) => {
        setPosts(prev => {
            const next = prev.filter(p => p.id !== id);
            localStorage.setItem('lale_social_posts', JSON.stringify(next));
            return next;
        });
    }, []);

    return { posts, loading, savePost, removePost };
};
