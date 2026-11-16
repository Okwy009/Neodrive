// Site settings. Everything here is public (it ships to the browser).
// Supabase: Project Settings -> API. Use the "anon public" key, NEVER the service_role key.
window.NEODRIVE_CONFIG = {
  supabaseUrl: 'https://bushkocoastilgiyrkte.supabase.co',
  supabaseAnonKey: 'sb_publishable_kWkz67G2bL6pzRaVvflCgA_wsPinTZ4',
  // Where Vision Trade runs (no trailing slash).
  tradeUrl: location.hostname === 'localhost' || location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://vision-trade.onrender.com',    
};


