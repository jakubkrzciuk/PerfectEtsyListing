import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase nie jest skonfigurowany. Dodaj VITE_SUPABASE_URL i VITE_SUPABASE_ANON_KEY do .env');
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
);
