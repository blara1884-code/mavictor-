import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be defined in the environment variables");
}

// O tipo 'any' será substituído por tipos gerados do seu esquema Supabase posteriormente.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
