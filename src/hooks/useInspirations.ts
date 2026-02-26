// ============================================
// USE INSPIRATIONS HOOK
// Przechowuje ulubione wnętrza użytkownika w Supabase Database & Storage
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface InspirationItem {
    id: string;
    url: string;       // publiczny URL z Supabase Storage
    name: string;      // opis (np. "Skandynawski salon")
    style: string;     // styl AI (przesyłany do prompta)
    type: 'with_product' | 'empty';
    originalDimensions?: string;
    addedAt: string;
}

const BUCKET = 'listing-images';

export const useInspirations = (userId: string | undefined) => {
    const [items, setItems] = useState<InspirationItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Wczytaj z bazy danych Supabase (Trwałe)
    const fetchInspirations = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('inspirations')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const mapped: InspirationItem[] = (data || []).map((row: any) => ({
                id: row.id,
                url: row.url,
                name: row.name,
                style: row.style,
                type: row.type as 'with_product' | 'empty',
                originalDimensions: row.original_dimensions,
                addedAt: new Date(row.created_at).toLocaleDateString('pl-PL'),
            }));
            setItems(mapped);
        } catch (err) {
            console.error('Error fetching inspirations:', err);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchInspirations();
    }, [fetchInspirations]);

    // Dodaj nową inspirację
    const addInspiration = useCallback(async (
        base64: string,
        name: string,
        style: string,
        type: 'with_product' | 'empty' = 'empty',
        originalDimensions: string = ''
    ) => {
        if (!userId) return;
        setLoading(true);

        try {
            const id = `insp_${Date.now()}`;
            const ext = 'jpg';
            const path = `${userId}/inspirations/${id}.${ext}`;

            // Konwertuj base64 → blob
            const byteString = atob(base64.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: 'image/jpeg' });

            // 1. Upload do Supabase Storage
            const { error: storageError } = await supabase.storage
                .from(BUCKET)
                .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

            if (storageError) throw storageError;

            const { data: storageData } = supabase.storage.from(BUCKET).getPublicUrl(path);

            // 2. Zapisz w Supabase Database (Trwałe)
            const { error: dbError } = await supabase.from('inspirations').insert({
                id,
                user_id: userId,
                url: storageData.publicUrl,
                name,
                style,
                type,
                original_dimensions: originalDimensions
            });

            if (dbError) throw dbError;

            fetchInspirations();
        } catch (err) {
            console.error('Inspiration save error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, fetchInspirations]);

    // Usuń inspirację
    const removeInspiration = useCallback(async (id: string) => {
        if (!userId) return;

        try {
            // 1. Usuń z Storage
            await supabase.storage.from(BUCKET).remove([
                `${userId}/inspirations/${id}.jpg`
            ]);

            // 2. Usuń z Database
            await supabase.from('inspirations')
                .delete()
                .eq('id', id)
                .eq('user_id', userId);

            fetchInspirations();
        } catch (err) {
            console.error('Error removing inspiration:', err);
        }
    }, [userId, fetchInspirations]);

    return { items, loading, addInspiration, removeInspiration };
};
