import { createClient } from '@supabase/supabase-js';

// Safe fallbacks to prevent white screen crashes if Vercel env vars are missing
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn("⚠️ Warning: Supabase Environment Variables are missing in Vercel. Please add them in your Vercel project settings.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);