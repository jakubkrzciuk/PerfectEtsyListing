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
// Upload File → Supabase Storage → URL
// Obsługuje base64 oraz blob: URLs (filmy)
// ============================================
async function uploadFileToStorage(
    source: string,
    listingId: string,
    index: number,
    userId: string
): Promise<string> {
    // Sprawdź czy to już wgrany URL publiczny
    if (source.startsWith('http') && !source.startsWith('blob:')) return source;

    let blob: Blob;
    let mime: string;
    let ext: string;

    if (source.startsWith('blob:')) {
        // Obsługa filmów wyrenderowanych lokalnie (blob)
        const response = await fetch(source);
        blob = await response.blob();
        mime = blob.type;
        ext = mime.split('/')[1] || (mime.includes('video') ? 'webm' : 'jpg');
    } else {
        // Obsługa zdjęć base64
        const mimeMatch = source.match(/data:([^;]+);base64,/);
        mime = mimeMatch?.[1] || 'image/jpeg';
        ext = mime.split('/')[1] || 'jpg';

        const byteString = atob(source.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        blob = new Blob([ab], { type: mime });
    }

    // Ścieżka w buckecie
    const fileName = mime.includes('video') ? `video_${index}.${ext}` : `${index}.${ext}`;
    const path = `${userId}/${listingId}/${fileName}`;

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, {
            contentType: mime,
            upsert: true,
        });

    if (error) throw new Error(`Storage upload error: ${error.message}`);

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
                altText: row.alt_text || '',
                videos: row.videos || [],
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
    // Dodaj listing (lub aktualizuj jeśli nazwa ta sama)
    // ============================================
    const addItem = useCallback(async (item: HistoryItem) => {
        if (!userId) return;

        // 1. Sprawdź czy mamy już gobelin o tej samej nazwie
        const { data: existing } = await supabase
            .from('listings')
            .select('id, thumbnails')
            .eq('user_id', userId)
            .eq('name', item.name)
            .single();

        const targetId = existing?.id || item.id;
        const previousPhotos = existing?.thumbnails || [];

        // 2. Uploaduj tylko NOWE zdjęcia i filmy do Supabase Storage
        let thumbnailUrls: string[] = [];
        let videoUrls: string[] = [];

        try {
            // Rozdzielamy na zdjęcia i wideo (wideo to zazwyczaj blob: lub link .webm)
            const photoSources = item.thumbnails.filter(t => !t.startsWith('blob:') && !t.includes('video'));
            const videoSources = item.thumbnails.filter(t => t.startsWith('blob:') || t.includes('video'));

            thumbnailUrls = await Promise.all(
                photoSources.map((img, i) =>
                    uploadFileToStorage(img, targetId, i + previousPhotos.length, userId)
                )
            );
            
            videoUrls = await Promise.all(
                videoSources.map((vid, i) =>
                    uploadFileToStorage(vid, targetId, i, userId)
                )
            );

            // Łączymy stare URL-e z nowymi
            thumbnailUrls = [...previousPhotos, ...thumbnailUrls.filter(url => !previousPhotos.includes(url))];
        } catch (err) {
            console.error('Upload error:', err);
            thumbnailUrls = item.thumbnails.filter(t => t.startsWith('http') && !t.startsWith('blob:'));
        }

        // 3. Zapisz/Aktualizuj (UPSERT)
        const { error } = await supabase.from('listings').upsert({
            id: targetId,
            user_id: userId,
            name: item.name,
            title: item.title,
            tags: item.tags,
            colors: item.colors,
            thumbnails: thumbnailUrls,
            videos: videoUrls,
            alt_text: item.altText || '',
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
            created_at: existing ? undefined : new Date().toISOString()
        }, { onConflict: 'id' });

        if (error) {
            console.error('DB save error:', error);
            throw error;
        }

        // 4. Odśwież listę lokalną
        fetchItems();
    }, [userId, fetchItems]);

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
