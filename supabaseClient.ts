import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hrubgwggnnxyqeomhhyc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydWJnd2dnbm54eXFlb21oaHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMDUzNzAsImV4cCI6MjA3NzY4MTM3MH0.TZltc5EPe5N_gbt0i88ROUPoZtbS52Z1FImhLINehrs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
