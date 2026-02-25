// ============================================
// USE INSPIRATIONS HOOK
// Przechowuje ulubione wnętrza użytkownika w Supabase Storage
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface InspirationItem {
    id: string;
    url: string;       // publiczny URL z Supabase Storage
    name: string;      // opis (np. "Skandynawski salon")
    style: string;     // styl AI (przesyłany do prompta)
    type: 'with_product' | 'empty'; // Nowe: czy na zdjęciu jest już gobelin
    originalDimensions?: string;   // Nowe: co już tam jest (np. "80x100")
    addedAt: string;
}

const BUCKET = 'listing-images';
const STORAGE_KEY = 'lale_inspirations'; // localStorage fallback

export const useInspirations = (userId: string | undefined) => {
    const [items, setItems] = useState<InspirationItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Wczytaj z localStorage (szybkie, nie wymaga bazy)
    useEffect(() => {
        const saved = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
        if (saved) {
            try { setItems(JSON.parse(saved)); } catch { }
        }
    }, [userId]);

    const save = (updated: InspirationItem[]) => {
        setItems(updated);
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(updated));
    };

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

            // Upload do Supabase Storage
            const { error } = await supabase.storage
                .from(BUCKET)
                .upload(path, blob, { contentType: 'image/jpeg', upsert: true });

            if (error) throw error;

            const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

            const newItem: InspirationItem = {
                id,
                url: data.publicUrl,
                name,
                style,
                type,
                originalDimensions,
                addedAt: new Date().toLocaleDateString('pl-PL'),
            };

            save([newItem, ...items]);
        } catch (err) {
            console.error('Inspiration upload error:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [userId, items]);

    // Usuń inspirację
    const removeInspiration = useCallback(async (id: string) => {
        if (!userId) return;

        try {
            // Usuń z Storage
            await supabase.storage.from(BUCKET).remove([
                `${userId}/inspirations/${id}.jpg`
            ]);
        } catch { }

        save(items.filter(i => i.id !== id));
    }, [userId, items]);

    return { items, loading, addInspiration, removeInspiration };
};
