export const supabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
};

export function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.anonKey);
}

export async function mockSignIn(email: string, _password: string) {
  return { user: { id: 'local-user', email } };
}

export async function mockSignUp(email: string, _password: string, name: string) {
  return { user: { id: 'local-user', email, name } };
}
