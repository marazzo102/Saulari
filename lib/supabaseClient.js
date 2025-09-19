import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://demo.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.demo";

// Create Supabase client with fallback values for demo purposes
// Note: This will not work with a real database without proper environment variables
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
