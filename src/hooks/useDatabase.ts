// ============================================
// DATABASE HOOK - Supabase listings storage
// Zdjęcia → Supabase Storage (bucket)
// Dane → Supabase Database (tabela listings)
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { HistoryItem } from '../types';

const BUCKET = 'listing-images';

// ============================================
// Upload base64 image → Supabase Storage → URL
// ============================================
async function uploadImageToStorage(
    base64: string,
    listingId: string,
    index: number,
    userId: string
): Promise<string> {
    // Sprawdź czy to URL (już wgrany) czy base64
    if (base64.startsWith('http')) return base64;

    // Wyciągnij typ pliku z base64
    const mimeMatch = base64.match(/data:([^;]+);base64,/);
    const mime = mimeMatch?.[1] || 'image/jpeg';
    const ext = mime.split('/')[1] || 'jpg';

    // Zamień base64 na binarny Blob
    const byteString = atob(base64.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mime });

    // Ścieżka w buckecie: userId/listingId/0.jpg
    const path = `${userId}/${listingId}/${index}.${ext}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, {
            contentType: mime,
            upsert: true,
        });

    if (error) throw new Error(`Storage upload error: ${error.message}`);

    // Pobierz publiczny URL
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

// ============================================
// Usuń zdjęcia z Storage przy usuwaniu listingu
// ============================================
async function deleteImagesFromStorage(listingId: string, userId: string) {
    try {
        const { data: files } = await supabase.storage
            .from(BUCKET)
            .list(`${userId}/${listingId}`);

        if (files && files.length > 0) {
            const paths = files.map(f => `${userId}/${listingId}/${f.name}`);
            await supabase.storage.from(BUCKET).remove(paths);
        }
    } catch (err) {
        console.warn('Could not delete images from storage:', err);
    }
}

// ============================================
// MAIN HOOK
// ============================================
export const useDatabase = (userId: string | undefined) => {
    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pobierz listingi z bazy
    const fetchItems = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped: HistoryItem[] = (data || []).map((row: any) => ({
                id: row.id,
                date: new Date(row.created_at).toLocaleDateString('pl-PL'),
                thumbnails: row.thumbnails || [],
                title: row.title || '',
                tags: row.tags || [],
                name: row.name || '',
                colors: row.colors || [],
                platforms: row.platforms || { etsyLale: false, etsyShopniki: false, shopify: false, wescover: false },
                description: row.description || '',
                marketAnalysis: row.market_analysis || '',
                keywordStrategy: row.keyword_strategy || '',
                visualStyle: row.visual_style || '',
                visualDescription: row.visual_description || '',
                photoScore: row.photo_score || 0,
                photoType: row.photo_type || '',
                photoCritique: row.photo_critique || '',
                photoSuggestions: row.photo_suggestions || [],
                formData: row.form_data || null,
            }));

            setItems(mapped);
        } catch (err: any) {
            setError(err.message);
            console.error('DB fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    // ============================================
    // Dodaj listing + uploaduj zdjęcia do Storage
    // ============================================
    const addItem = useCallback(async (item: HistoryItem) => {
        if (!userId) return;

        // 1. Uploaduj wszystkie zdjęcia do Supabase Storage
        let thumbnailUrls: string[] = [];
        if (item.thumbnails && item.thumbnails.length > 0) {
            try {
                thumbnailUrls = await Promise.all(
                    item.thumbnails.map((img, i) =>
                        uploadImageToStorage(img, item.id, i, userId)
                    )
                );
            } catch (err) {
                console.error('Image upload error:', err);
                // Fallback: zapisz bez zdjęć jeśli upload zawiedzie
                thumbnailUrls = [];
            }
        }

        // 2. Zapisz listing z URL-ami (nie base64)
        const { error } = await supabase.from('listings').insert({
            id: item.id,
            user_id: userId,
            name: item.name,
            title: item.title,
            tags: item.tags,
            colors: item.colors,
            thumbnails: thumbnailUrls,
            platforms: item.platforms,
            description: item.description,
            market_analysis: item.marketAnalysis,
            keyword_strategy: item.keywordStrategy,
            visual_style: item.visualStyle,
            visual_description: item.visualDescription,
            photo_score: item.photoScore,
            photo_type: item.photoType,
            photo_critique: item.photoCritique,
            photo_suggestions: item.photoSuggestions,
            form_data: item.formData || null,
        });

        if (error) {
            console.error('DB insert error:', error);
            throw error;
        }

        // 3. Zaktualizuj stan lokalny z URL-ami
        setItems(prev => [{ ...item, thumbnails: thumbnailUrls }, ...prev]);
    }, [userId]);

    // Usuń listing + zdjęcia z Storage
    const removeItem = useCallback(async (id: string) => {
        if (!userId) return;

        // Usuń zdjęcia z bucketa
        await deleteImagesFromStorage(id, userId);

        // Usuń z bazy
        const { error } = await supabase
            .from('listings')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error('DB delete error:', error);
            throw error;
        }

        setItems(prev => prev.filter(i => i.id !== id));
    }, [userId]);

    // Aktualizuj platformy
    const updatePlatforms = useCallback(async (id: string, platforms: HistoryItem['platforms']) => {
        if (!userId) return;

        const { error } = await supabase
            .from('listings')
            .update({ platforms })
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error('DB update error:', error);
            return;
        }

        setItems(prev => prev.map(i => i.id === id ? { ...i, platforms } : i));
    }, [userId]);

    return { items, loading, error, addItem, removeItem, updatePlatforms, refetch: fetchItems };
};
