import { createClient } from '@supabase/supabase-js';
import { fetchWithRetry } from '../utils/networkUtils';

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Add network error handling wrapper
export const supabaseWithRetry = {
  from: (table) => ({
    ...supabase.from(table),
    select: async (...args) => {
      return await fetchWithRetry(() => supabase.from(table).select(...args));
    },
    insert: async (...args) => {
      return await fetchWithRetry(() => supabase.from(table).insert(...args));
    },
    update: async (...args) => {
      return await fetchWithRetry(() => supabase.from(table).update(...args));
    },
    delete: async (...args) => {
      return await fetchWithRetry(() => supabase.from(table).delete(...args));
    },
  }),
};
