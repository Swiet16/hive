// Supabase client. Resilient: if env vars are missing, returns a stub
// that resolves to empty data so the UI still renders. In production
// with VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY set, real backend
// is used — auth, products, orders, profiles, user_roles all live there.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

function createSupabaseClient() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || (typeof process !== 'undefined' && process.env?.SUPABASE_URL);
  const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || (typeof process !== 'undefined' && process.env?.SUPABASE_PUBLISHABLE_KEY);

  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.warn('[Supabase] Missing env vars — running in offline preview mode. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable real backend.');
    return null;
  }

  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      storage: typeof window !== 'undefined' ? localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
}

let _supabase: ReturnType<typeof createSupabaseClient> | null | undefined;
function getSupabase() {
  if (_supabase === undefined) _supabase = createSupabaseClient();
  return _supabase;
}

// Stub client used when env vars are missing. Returns no-op responses.
function makeStub() {
  const noopRes = () => Promise.resolve({ data: null, error: null });
  const chain: any = new Proxy(() => {}, {
    get(_, prop) {
      if (prop === 'then' || prop === 'catch' || prop === 'finally') {
        // Make it thenable — resolve to { data: null, error: null }
        if (prop === 'then') return (resolve: any) => Promise.resolve({ data: null, error: null, count: null, status: 200, statusText: 'OK' }).then(resolve);
        return undefined;
      }
      return chain;
    },
    apply() {
      return chain;
    },
  });
  const authStub = {
    getSession: noopRes,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signInWithPassword: noopRes,
    signUp: noopRes,
    signOut: noopRes,
    getUser: noopRes,
    refreshSession: noopRes,
  };
  return new Proxy({} as any, {
    get(_, prop) {
      if (prop === 'auth') return authStub;
      // Anything else (.from('x').select(...).eq(...)) returns the chain.
      return chain;
    },
  });
}

export const supabase = new Proxy({} as any, {
  get(_, prop) {
    const real = getSupabase();
    if (real) return Reflect.get(real, prop);
    // Fallback to stub
    return Reflect.get(makeStub(), prop);
  },
});
