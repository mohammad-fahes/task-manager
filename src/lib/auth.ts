

import { supabase, hasSupabaseEnv } from "./supabaseClient";

function requireSupabase() {
  if (!hasSupabaseEnv() || !supabase) {
    throw new Error(
      "Supabase env is missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local"
    );
  }
}
export async function signUp(email: string, password: string) {
  requireSupabase();
  const { data, error } = await supabase!.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  requireSupabase();
  const { data, error } = await supabase!.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  requireSupabase();
  const { error } = await supabase!.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}
