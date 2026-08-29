import { createClient } from '@supabase/supabase-js';

// Read the secure environment variables using import.meta.env (Vite's method)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase Environment Variables. Check your .env file!");
}

export const supabase = createClient(supabaseUrl, supabaseKey);