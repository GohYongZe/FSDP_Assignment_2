import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Supabase project credentials
const supabaseUrl = 'https://gwgtpdaggnbaplmllnfj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3Z3RwZGFnZ25iYXBsbWxsbmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NTk1ODIsImV4cCI6MjA3OTAzNTU4Mn0.eL-nfwE61f32kISTNmUYW7kl_zwcaoB43qMLqkeEG40';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
