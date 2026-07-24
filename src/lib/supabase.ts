import { createClient } from "@supabase/supabase-js";

// Supabase configuration for project https://lwaznzwyqxuttgjotkzr.supabase.co
const env = (import.meta as any)?.env || process.env || {};

export const SUPABASE_URL = 
  env.VITE_SUPABASE_URL || 
  process.env.SUPABASE_URL || 
  "https://lwaznzwyqxuttgjotkzr.supabase.co";

export const SUPABASE_ANON_KEY = 
  env.VITE_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3YXpuend5cXh1dHRnam90a3pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTA0MDAwMH0.placeholder";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

