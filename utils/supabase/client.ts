import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createClient = () => createSupabaseClient(supabaseUrl, supabaseAnonKey);

export const signInWithGoogle = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) throw error;
};

export const logActivity = async (action: string, details?: any) => {
  const supabase = createClient();
  const { error } = await supabase.from('activity_logs').insert({
    action,
    details,
  });
  if (error) {
    console.error('Error logging activity:', error);
  }
};