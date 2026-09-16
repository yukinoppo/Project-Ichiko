const SUPABASE_URL = "https://lzxbsruzaqqjlqyhtvwx.supabase.co";
const SUPABASE_KEY = "sb_publishable_40Diyrrl6ZJUP_AssHf5WA_gTYSAhk7";

export const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);