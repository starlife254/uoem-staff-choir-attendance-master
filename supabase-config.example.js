// Copy this file to supabase-config.js and fill in your own values.
// DO NOT commit the real supabase-config.js — it's in .gitignore.
window.SUPABASE_URL = 'https://YOUR-PROJECT.supabase.co';
window.SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';
window.sb = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);