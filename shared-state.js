/* ═══════════════════════════════════════════════════════
   TOKI Design System v2.2 — shared-state.js
   Global state management, auth, theme helpers
   FIXED: Demo accounts, late-arrival flagging, event IDs,
          announcement scoping, archive before clear
═══════════════════════════════════════════════════════ */

const TOKI = (() => {
  const STATE_KEY = 'ae_state';
  const USER_KEY  = 'ae_user';
  const THEME_KEY = 'toki_theme';

  /* ── Demo accounts (hardcoded for presentation) ── */
  const DEMO_USERS = [
    // Organizers
    { id: 'ORG-001', name: 'Ms. Ana Reyes',    dept: 'College of IT',       role: 'organizer', password: 'org123' },
    { id: 'ORG-002', name: 'Mr. Carlo Santos',  dept: 'Student Affairs',     role: 'organizer', password: 'org123' },
    // Students
    { id: '2021-00101', name: 'Maria Santos',   course: 'BSIT-3A', year: '3rd Year', section: 'A', role: 'student', password: 'stu123' },
    { id: '2021-00102', name: 'Juan dela Cruz',  course: 'BSIT-3A', year: '3rd Year', section: 'A', role: 'student', password: 'stu123' },
    { id: '2021-00103', name: 'Liza Mendoza',   course: 'BSIT-3B', year: '3rd Year', section: 'B', role: 'student', password: 'stu123' },
    { id: '2021-00104', name: 'Ryan Garcia',    course: 'BSBA-2A', year: '2nd Year', section: 'A', role: 'student', password: 'stu123' },
    { id: '2021-00105', name: 'Chloe Reyes',    course: 'BSN-1A',  year: '1st Year', section: 'A', role: 'student', password: 'stu123' },
    { id: '2022-00201', name: 'Paolo Villanueva',course: 'BSIT-2A', year: '2nd Year', section: 'A', role: 'student', password: 'stu123' },
    { id: '2022-00202', name: 'Angela Cruz',    course: 'BSED-1B', year: '1st Year', section: 'B', role: 'student', password: 'stu123' },
    { id: '2022-00203', name: 'Marco Dela Rosa', course: 'BSCRIM-2C',year: '2nd Year', section: 'C', role: 'student', password: 'stu123' },
  ];

  function authenticate(idOrName, password, role) {
    // Try exact ID match first
    let user = DEMO_USERS.find(u =>
      u.role === role &&
      (u.id.toLowerCase() === idOrName.toLowerCase() ||
       u.name.toLowerCase() === idOrName.toLowerCase()) &&
      u.password === password
    );
    return user || null;
  }

  function getAllStudents() {
    return DEMO_USERS.filter(u => u.role === 'student');
  }

  function defaultState() {
    return {
      eventId:      null,
      event:        null,
      checkinCode:  null,
      checkinOpen:  false,
      checkoutCode: null,
      checkoutOpen: false,
      orgLat:       null,
      orgLng:       null,
      attendance:   [],
      gracePeriod:  15, // minutes after event start before flagging late
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

  /* ── Archive current event data before clearing ── */
  function archiveAndClear() {
    const st = load();
    if (st.event && st.attendance.length > 0) {
      try {
        const archives = JSON.parse(localStorage.getItem('toki_archives') || '[]');
        archives.push({
          eventId:   st.eventId,
          event:     st.event,
          attendance: st.attendance,
          archivedAt: new Date().toLocaleString(),
        });
        localStorage.setItem('toki_archives', JSON.stringify(archives));
      } catch (e) { /* archive failed silently */ }
    }
    // Clear announcements tied to this event
    if (st.eventId) {
      try {
        const anns = JSON.parse(localStorage.getItem('toki_announcements') || '[]');
        const filtered = anns.filter(a => a.eventId !== st.eventId);
        localStorage.setItem('toki_announcements', JSON.stringify(filtered));
      } catch (e) { /* */ }
    }
    save(defaultState());
  }

  function loadArchives() {
    try { return JSON.parse(localStorage.getItem('toki_archives') || '[]'); } catch { return []; }
  }

  function getUser() {
    try { return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  }

  function setUser(user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
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

  function genEventId() {
    return 'EVT-' + Date.now();
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

  /* ── Late arrival check ── */
  function isLate(checkinTime, eventTime, gracePeriodMins) {
    if (!checkinTime || !eventTime) return false;
    try {
      const [eh, em] = eventTime.split(':').map(Number);
      const grace = gracePeriodMins || 15;
      const cutoff = eh * 60 + em + grace;

      // Parse checkin time (handles "08:30 AM" or "08:30")
      let ch, cm;
      if (checkinTime.includes('AM') || checkinTime.includes('PM')) {
        const [time, period] = checkinTime.split(' ');
        [ch, cm] = time.split(':').map(Number);
        if (period === 'PM' && ch !== 12) ch += 12;
        if (period === 'AM' && ch === 12) ch = 0;
      } else {
        [ch, cm] = checkinTime.split(':').map(Number);
      }
      return ch * 60 + cm > cutoff;
    } catch { return false; }
  }

  return {
    DEMO_USERS,
    authenticate,
    getAllStudents,
    defaultState,
    load, save,
    archiveAndClear,
    loadArchives,
    getUser, setUser,
    requireOrganizer, requireStudent,
    logout,
    initTheme, applyTheme, toggleTheme,
    genCode, genEventId,
    getDistance, nowTime,
    isLate,
  };
})();