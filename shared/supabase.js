const SUPABASE_URL = "https://gsibigogjslnytlvaoyh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_y4wNRUaVxqfT1IRy-4uOKA_YbeJxb5f";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

