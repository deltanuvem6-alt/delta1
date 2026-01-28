import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hrubgwggnnxyqeomhhyc.supabase.co';
// The anon key is safe to be exposed in a client-side application.
// RLS (Row Level Security) should be enabled in your Supabase project to secure your data.
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydWJnd2dnbm54eXFlb21oaHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDUzNzAsImV4cCI6MjA3NzY4MTM3MH0.TZltc5EPe5N_gbt0i88ROUPoZtbS52Z1FImhLINehrs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
