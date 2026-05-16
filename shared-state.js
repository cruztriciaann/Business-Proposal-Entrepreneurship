/* ── TOKI Shared State ── */
const TOKI = (() => {

  function getUser() {
    return JSON.parse(sessionStorage.getItem('ae_user') || 'null');
  }
  function requireOrganizer() {
    const u = getUser();
    if (!u || u.role !== 'organizer') { window.location.href = 'login.html'; return null; }
    return u;
  }
  function save(st) {
    localStorage.setItem('ae_state', JSON.stringify({
      event: st.event, checkinCode: st.checkinCode, checkoutCode: st.checkoutCode,
      checkinOpen: st.checkinOpen, checkoutOpen: st.checkoutOpen,
      attendance: st.attendance, orgLat: st.orgLat, orgLng: st.orgLng,
    }));
  }
  function load() {
    const raw = localStorage.getItem('ae_state');
    if (!raw) return defaultState();
    const s = JSON.parse(raw);
    return {
      event: s.event || null, checkinCode: s.checkinCode || null,
      checkoutCode: s.checkoutCode || null, checkinOpen: s.checkinOpen || false,
      checkoutOpen: s.checkoutOpen || false, attendance: s.attendance || [],
      orgLat: s.orgLat || null, orgLng: s.orgLng || null,
    };
  }
  function defaultState() {
    return {
      event: null, checkinCode: null, checkoutCode: null,
      checkinOpen: false, checkoutOpen: false,
      attendance: [], orgLat: null, orgLng: null,
    };
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('toki_theme', theme);
    const icon  = document.getElementById('theme-icon');
    const label = document.getElementById('theme-label');
    if (icon)  icon.className   = theme === 'light' ? 'ti ti-moon' : 'ti ti-sun';
    if (label) label.textContent = theme === 'light' ? 'Dark Mode'  : 'Light Mode';
  }
  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'dark';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  }
  function initTheme() { applyTheme(localStorage.getItem('toki_theme') || 'dark'); }
  function logout() { sessionStorage.removeItem('ae_user'); window.location.href = 'login.html'; }
  function genCode() { return String(Math.floor(1000 + Math.random() * 9000)); }

  return { getUser, requireOrganizer, save, load, defaultState, applyTheme, toggleTheme, initTheme, logout, genCode };
})();