import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pdwmcfthiwpjuillrkci.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBkd21jZnRoaXdwanVpbGxya2NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4ODgxNDcsImV4cCI6MjA2NjQ2NDE0N30.meQXDeKvWvkMBfj5pZuqXgAMQPisu0IrF-wen44erUk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;