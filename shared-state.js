/* ═══════════════════════════════════════════════════════
   TOKI Design System v2.1 — shared-state.js
   Global state management, auth, theme helpers
═══════════════════════════════════════════════════════ */

const TOKI = (() => {
  const STATE_KEY = 'ae_state';
  const USER_KEY  = 'ae_user';
  const THEME_KEY = 'toki_theme';

  function defaultState() {
    return {
      event:        null,
      checkinCode:  null,
      checkinOpen:  false,
      checkoutCode: null,
      checkoutOpen: false,
      orgLat:       null,
      orgLng:       null,
      attendance:   [],
    };
  }

  function load() {
    try {
      const d = localStorage.getItem(STATE_KEY);
      return d ? { ...defaultState(), ...JSON.parse(d) } : defaultState();
    } catch { return defaultState(); }
  }

  function save(state) {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }

  function getUser() {
    try { return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  }

  function requireOrganizer() {
    const u = getUser();
    if (!u || u.role !== 'organizer') { window.location.href = 'login.html'; return null; }
    return u;
  }

  function requireStudent() {
    const u = getUser();
    if (!u || u.role !== 'student') { window.location.href = 'login.html'; return null; }
    return u;
  }

  function logout() {
    sessionStorage.removeItem(USER_KEY);
    window.location.href = 'login.html';
  }

  function _syncThemeUI(theme) {
    const icon  = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');
    if (icon)  icon.className    = theme === 'light' ? 'ti ti-moon' : 'ti ti-sun';
    if (label) label.textContent = theme === 'light' ? 'Dark Mode'  : 'Light Mode';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    _syncThemeUI(theme);
  }

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    _syncThemeUI(saved);
  }

  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  }

  function genCode() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  function getDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function nowTime() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return {
    defaultState, load, save,
    getUser, requireOrganizer, requireStudent, logout,
    initTheme, applyTheme, toggleTheme,
    genCode, getDistance, nowTime,
  };
})();
