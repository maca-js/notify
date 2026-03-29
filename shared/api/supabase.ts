import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/api/supabase.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser / RSC client (anon key)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-only admin client (service role — bypasses RLS)
export function getAdminClient() {
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}
