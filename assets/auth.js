/*
 * auth.js — Supabase sign-in for Vision Enterprise, plus the hand-off to Vision Trade.
 *
 * Load order on each page:  supabase-js (CDN) -> assets/config.js -> assets/auth.js -> dc-lite.js
 *
 * Exposes window.NeoAuth. Any element with a data-trade-link attribute opens Vision Trade,
 * already signed in when the visitor has a session here.
 * If config.js has no Supabase keys yet, NeoAuth.enabled is false and the pages fall back to demo mode.
 */
(function () {
  'use strict';
  var cfg = window.NEODRIVE_CONFIG || {};
  var tradeUrl = (cfg.tradeUrl || '').replace(/\/+$/, '');
  var enabled = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase && window.supabase.createClient);
  var client = enabled ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;

  function pageUrl(page, query) {
    var base = location.origin + location.pathname.replace(/[^/]*$/, '');
    return base + page + (query ? '?' + query : '');
  }

  function friendly(error) {
    var msg = (error && error.message) || String(error || 'Something went wrong');
    if (/invalid login credentials/i.test(msg)) return 'Incorrect email or password.';
    if (/email not confirmed/i.test(msg)) return 'Please confirm your email first. Check your inbox for the link.';
    if (/already registered/i.test(msg)) return 'An account with this email already exists. Sign in instead.';
    if (/rate limit/i.test(msg)) return 'Too many attempts. Please wait a minute and try again.';
    return msg;
  }

  async function getSession() {
    if (!client) return null;
    var res = await client.auth.getSession(); // refreshes an expired token automatically
    return res.data.session;
  }

  var NeoAuth = {
    enabled: enabled,
    client: client,
    tradeUrl: tradeUrl,
    friendly: friendly,
    getSession: getSession,

    async getUser() {
      var s = await getSession();
      if (!s) return null;
      var meta = s.user.user_metadata || {};
      return { id: s.user.id, email: s.user.email, name: meta.full_name || meta.name || s.user.email.split('@')[0] };
    },

    async signIn(email, password) {
      var res = await client.auth.signInWithPassword({ email: email, password: password });
      if (res.error) throw new Error(friendly(res.error));
      return res.data.session;
    },

    // Returns { session } when email confirmation is off, or { needsConfirmation: true } when it is on.
    async signUp(name, email, password, next) {
      var res = await client.auth.signUp({
        email: email,
        password: password,
        options: { data: { full_name: name }, emailRedirectTo: pageUrl('account.html', next ? 'next=' + encodeURIComponent(next) : '') },
      });
      if (res.error) throw new Error(friendly(res.error));
      if (res.data.user && res.data.user.identities && res.data.user.identities.length === 0)
        throw new Error('An account with this email already exists. Sign in instead.');
      return res.data.session ? { session: res.data.session } : { needsConfirmation: true };
    },

    async resetPassword(email) {
      var res = await client.auth.resetPasswordForEmail(email, { redirectTo: pageUrl('account.html', 'mode=reset') });
      if (res.error) throw new Error(friendly(res.error));
    },

    async updatePassword(password) {
      var res = await client.auth.updateUser({ password: password });
      if (res.error) throw new Error(friendly(res.error));
    },

    async signOut() {
      if (client) await client.auth.signOut();
    },

    // Open Vision Trade. The access token travels in the URL fragment, which browsers never send to servers.
    async goToTrade(next) {
      if (!tradeUrl) return;
      if (!enabled) { location.href = tradeUrl; return; }
      var s = await getSession();
      if (!s) { location.href = 'account.html?next=trade'; return; }
      location.href = tradeUrl + '/sso.html#access_token=' + encodeURIComponent(s.access_token) + (next ? '&next=' + encodeURIComponent(next) : '');
    },
  };

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('[data-trade-link]');
    if (!link) return;
    e.preventDefault();
    NeoAuth.goToTrade(link.getAttribute('data-trade-next') || '');
  });

  window.NeoAuth = NeoAuth;
})();
