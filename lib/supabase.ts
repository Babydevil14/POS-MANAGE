import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oinotdezgunxbkftwfdu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbm90ZGV6Z3VueGJrZnR3ZmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODc0NzksImV4cCI6MjA2NTY2MzQ3OX0.l5O2vl9Lr0LwhTv5B4FtrMD4sTi7YmTPvNejv_yks4k';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

