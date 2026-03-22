import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client that bypasses RLS.
 * Only use in server-side API routes where we've already validated the request.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const secretKey = process.env.SUPABASE_SECRET_DEFAULT_KEY!;

  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_DEFAULT_KEY is not set");
  }

  return createSupabaseClient(url, secretKey);
}
