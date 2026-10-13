import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function supabaseSecretKey(): string {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function supabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseSecretKey() && (process.env.SESSION_SECRET?.length ?? 0) >= 16);
}

export function supabaseAdmin(): SupabaseClient {
  return createClient(supabaseUrl(), supabaseSecretKey(), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("User-Agent", "yal-boutique-server");
        return fetch(input, { ...init, headers });
      },
    },
  });
}
